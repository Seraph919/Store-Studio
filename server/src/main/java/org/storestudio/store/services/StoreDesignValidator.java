package org.storestudio.store.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.UpdateStoreDesignDto;
import org.storestudio.store.repositories.ProductRepository;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.util.*;

/** Strict validation of the small supported section language, before any writes. */
@Component
@RequiredArgsConstructor
public class StoreDesignValidator {
    private final ProductRepository products;
    private final ObjectMapper mapper = new ObjectMapper();
    private static final Map<String, Set<String>> VARIANTS = Map.of(
        "Hero", Set.of("layered", "fullscreen", "split"),
        "Categories", Set.of("cards", "strip"),
        "FeaturedProducts", Set.of("editorial-grid", "carousel"),
        "ProductCollection", Set.of("curated-packs", "grid"),
        "BrandStory", Set.of("split-right", "split-left"),
        "Reviews", Set.of("grid", "cards"), "PromotionalBanner", Set.of("full"));
    private static final Set<String> COMMON = Set.of("title", "subtitle", "eyebrow");
    private static final Map<String, Set<String>> FIELDS = Map.of(
        "Hero", Set.of("intro", "cta", "ctaLink", "imageUrl", "cutoutImage", "alignment", "overlayOpacity"),
        "Categories", Set.of("maxCategories"),
        "FeaturedProducts", Set.of("strategy", "columns", "maxProducts", "productIds", "categoryName"),
        "ProductCollection", Set.of("strategy", "columns", "maxProducts", "productIds", "categoryName"),
        "BrandStory", Set.of("description", "cta", "ctaLink", "imageUrl"),
        "Reviews", Set.of(), "PromotionalBanner", Set.of("text", "ctaText", "ctaLink", "bgColor", "textColor"));

    public void validate(UpdateStoreDesignDto dto) {
        require(dto.getTemplate() != null && dto.getColorMode() != null && dto.getFontPreset() != null, "Template, color mode and font are required");
        color(dto.getAccentColor(), "Accent color");
        String json = dto.getDesignConfig();
        require(json != null && json.length() <= 250_000, "Design must be at most 250000 characters");
        JsonNode root;
        try { root = mapper.readTree(json); }
        catch (Exception error) { throw invalid("Design must be valid JSON"); }
        require(root != null && root.isObject(), "Design must be an object");
        require(root.has("sections") && root.get("sections").isArray()
                && (root.size() == 1 || (root.size() == 2 && root.has("templateDrafts"))),
                "Design may contain sections and optional templateDrafts only");
        validateSections(root.get("sections"));

        // Preserve independently edited sections/media and appearance for each template.
        JsonNode drafts = root.get("templateDrafts");
        if (drafts != null) {
            require(drafts.isObject() && drafts.size() <= 3, "Template drafts must be an object with at most three templates");
            drafts.fields().forEachRemaining(entry -> {
                require(Set.of("MINIMAL", "MODERN", "EDITORIAL").contains(entry.getKey()), "Unknown template draft");
                JsonNode snapshot = entry.getValue();
                require(snapshot.isObject() && snapshot.size() == 5
                        && snapshot.has("sections") && snapshot.has("colorMode")
                        && snapshot.has("paletteId") && snapshot.has("accentColor")
                        && snapshot.has("fontPreset"), "Each template draft must include sections and appearance settings");
                require(snapshot.get("sections").isArray(), "Template sections must be an array");
                require(Set.of("LIGHT", "DARK").contains(text(snapshot.get("colorMode"), "Mode", 10)), "Invalid draft mode");
                require(Set.of("CHAMPAGNE", "NAVY_GOLD", "MONOCHROME", "FOREST_COPPER")
                        .contains(text(snapshot.get("paletteId"), "Palette", 32)), "Invalid draft palette");
                require(Set.of("ELEGANT", "MODERN", "CLASSIC")
                        .contains(text(snapshot.get("fontPreset"), "Font", 16)), "Invalid draft font");
                color(text(snapshot.get("accentColor"), "Accent", 7), "Accent");
                validateSections(snapshot.get("sections"));
            });
        }
        if (dto.getBranding() != null) {
            var branding = dto.getBranding();
            require(branding.getStoreName() != null && !branding.getStoreName().isBlank() && branding.getStoreName().length() <= 120, "Store name is required and must be at most 120 characters");
            require(branding.getStoreTagline() == null || branding.getStoreTagline().length() <= 255, "Tagline must be at most 255 characters");
            imageUrl(branding.getLogoUrl(), "Logo URL"); imageUrl(branding.getLogoDarkUrl(), "Dark logo URL");
        }
    }

    private void validateSections(JsonNode sections) {
        require(sections.size() <= 30, "At most 30 homepage sections are allowed");
        Set<String> ids = new HashSet<>();
        Set<String> targets = new HashSet<>();
        for (JsonNode section : sections) {
            require(section.isObject(), "Each section must be an object");
            String id = text(section.get("id"), "Section ID", 80);
            require(id.matches("[a-zA-Z][a-zA-Z0-9_-]*") && ids.add(id), "Section IDs must be unique and contain only letters, numbers, hyphens and underscores");
            require(section.has("enabled") && section.get("enabled").isBoolean(), id + ": visibility must be true or false");
            if (section.get("enabled").asBoolean()) targets.add("section-" + id);
        }
        for (JsonNode section : sections) {
            String id = section.get("id").asText();
            require(section.size() == 5 && section.has("type") && section.has("variant") && section.has("settings"), id + ": expected id, type, variant, enabled and settings");
            String type = text(section.get("type"), id + " type", 40);
            require(VARIANTS.containsKey(type), id + ": unsupported section type");
            require(VARIANTS.get(type).contains(text(section.get("variant"), id + " layout", 40)), id + ": unsupported layout");
            JsonNode settings = section.get("settings");
            require(settings.isObject(), id + ": settings must be an object");
            settings.fields().forEachRemaining(field -> {
                String key = field.getKey(); JsonNode value = field.getValue(); String label = id + ": " + key;
                require(COMMON.contains(key) || FIELDS.get(type).contains(key), label + " is not supported");
                switch (key) {
                    case "columns" -> number(value, label, 2, 4);
                    case "maxProducts" -> number(value, label, 1, 16);
                    case "maxCategories" -> number(value, label, 1, 12);
                    case "overlayOpacity" -> number(value, label, 0, 100);
                    case "productIds" -> productIds(value, label);
                    case "alignment" -> require(Set.of("left", "center", "right").contains(text(value, label, 10)), label + " must be left, center or right");
                    case "strategy" -> require(Set.of("featured", "newest", "custom", "category", "packs", "curated").contains(text(value, label, 20)), label + " is not supported; select products or use newest, category or packs");
                    case "bgColor", "textColor" -> color(text(value, label, 7), label);
                    case "imageUrl", "cutoutImage" -> imageUrl(text(value, label, 2048), label);
                    case "ctaLink" -> internalLink(text(value, label, 2048), targets, label);
                    default -> text(value, label, Set.of("intro", "description", "text").contains(key) ? 2000 : 255);
                }
            });
        }
    }

    private void productIds(JsonNode node, String label) {
        require(node.isArray() && node.size() <= 50, label + " must be a list of at most 50 product IDs");
        Set<Long> ids = new HashSet<>();
        for (JsonNode id : node) {
            require(id.isIntegralNumber() && id.canConvertToLong() && id.longValue() > 0 && ids.add(id.longValue()), label + " must contain unique positive product IDs");
        }
        require(products.findAllById(ids).size() == ids.size(), label + " includes a product that no longer exists");
    }
    static void imageUrl(String value, String label) {
        if (value == null || value.isEmpty()) return;
        require(value.length() <= 2048 && !value.contains("\\") && !value.chars().anyMatch(Character::isISOControl), label + " is invalid");
        try {
            URI uri = URI.create(value);
            boolean local = value.startsWith("/") && !value.startsWith("//") && uri.getAuthority() == null && !uri.getPath().contains("..") && !uri.getPath().startsWith("//");
            boolean https = "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null && uri.getUserInfo() == null;
            require(local || https, label + " must be an HTTPS image URL or a local asset path");
        } catch (IllegalArgumentException error) { throw invalid(label + " must be an HTTPS image URL or a local asset path"); }
    }
    private static void internalLink(String value, Set<String> targets, String label) {
        if (value.isEmpty()) return;
        try {
            URI uri = URI.create(value);
            require(value.startsWith("/") && !value.startsWith("//") && !value.contains("\\") && uri.getAuthority() == null && uri.getScheme() == null, label + " must be a store route");
            require(uri.getPath().matches("/(|shop|products/[1-9][0-9]*|checkout|ring-size-guide)"), label + " must point to a public store page");
            require(uri.getFragment() == null || (uri.getPath().equals("/") && targets.contains(uri.getFragment())), label + " points to a hidden or missing section");
        } catch (IllegalArgumentException error) { throw invalid(label + " must point to a public store page and an existing section"); }
    }
    private static String text(JsonNode node, String label, int max) {
        require(node != null && node.isTextual() && node.asText().length() <= max, label + " must be text of at most " + max + " characters");
        String value = node.asText();
        require(!value.contains("<") && !value.contains(">") && !value.contains("\u0000"), label + " must be plain text");
        return value;
    }
    private static void number(JsonNode value, String label, int min, int max) {
        require(value.isIntegralNumber() && value.canConvertToInt() && value.asInt() >= min && value.asInt() <= max, label + " must be an integer between " + min + " and " + max);
    }
    private static void color(String value, String label) { require(value != null && value.matches("#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}"), label + " must be a hex color"); }
    private static void require(boolean condition, String message) { if (!condition) throw invalid(message); }
    private static IllegalArgumentException invalid(String message) { return new IllegalArgumentException(message); }
}
