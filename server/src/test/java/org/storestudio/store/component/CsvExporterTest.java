package org.storestudio.store.component;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class CsvExporterTest {
    private final CsvExporter exporter = new CsvExporter();

    @Test
    void neutralizesFormulaAndControlPrefixes() {
        for (String value : List.of("=1+1", "+123", "-1+2", "@SUM(A1)", "  =1+1",
                "\t=1+1", "\r=1+1", "\n=1+1", "\0=1+1")) {
            assertEquals("\"'" + value + "\"", exporter.escapeCsvField(value));
        }
    }

    @Test
    void preservesCsvEscapingAndNumericValues() {
        assertEquals("\"'=HYPERLINK(\"\"https://example.com\"\")\"",
                exporter.escapeCsvField("=HYPERLINK(\"https://example.com\")"));
        assertEquals("\"Hello, \"\"Sam\"\"\"", exporter.escapeCsvField("Hello, \"Sam\""));
        assertEquals("-12.50", exporter.escapeCsvField(new BigDecimal("-12.50")));
        assertEquals("Alice", exporter.escapeCsvField("Alice"));
        assertEquals("", exporter.escapeCsvField(null));
        assertEquals("Name\r\n\"'=1+1\"\r\n",
                exporter.toCsv(List.of("Name"), List.of(List.of("=1+1"))));
    }
}
