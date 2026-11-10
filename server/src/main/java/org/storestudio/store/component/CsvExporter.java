package org.storestudio.store.component;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CsvExporter {

    public String escapeCsvField(Object field) {
        if (field == null) {
            return "";
        }
        String str = field.toString();
        // Spreadsheet imports can execute customer-provided formula text.
        // https://community.owasp.org/attacks/CSV_Injection
        String significant = str.stripLeading();
        boolean formula = !(field instanceof Number) && !significant.isEmpty()
                && "=+-@".indexOf(significant.charAt(0)) >= 0;
        boolean controlPrefix = !str.isEmpty() && (str.charAt(0) == '\t'
                || str.charAt(0) == '\r' || str.charAt(0) == '\n' || str.charAt(0) == '\0');
        if (formula || controlPrefix) {
            str = "'" + str;
        }
        boolean needsQuotes = formula || controlPrefix || str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r");
        if (str.contains("\"")) {
            str = str.replace("\"", "\"\"");
        }
        if (needsQuotes) {
            return "\"" + str + "\"";
        }
        return str;
    }

    public String toCsv(List<String> headers, List<List<Object>> rows) {
        StringBuilder sb = new StringBuilder();
        // Headers
        for (int i = 0; i < headers.size(); i++) {
            sb.append(escapeCsvField(headers.get(i)));
            if (i < headers.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("\r\n");

        // Rows
        for (List<Object> row : rows) {
            for (int i = 0; i < row.size(); i++) {
                sb.append(escapeCsvField(row.get(i)));
                if (i < row.size() - 1) {
                    sb.append(",");
                }
            }
            sb.append("\r\n");
        }

        return sb.toString();
    }
}

