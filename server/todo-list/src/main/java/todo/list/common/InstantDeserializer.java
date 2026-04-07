package todo.list.common;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;

@ApplicationScoped
public class InstantDeserializer extends JsonDeserializer<Instant> {
    private static final List<DateTimeFormatter> FORMATTERS = Arrays.asList(
            DateTimeFormatter.ofPattern("d/M/yyyy"), // 21/7/2028
            DateTimeFormatter.ofPattern("M/d/yyyy"), // 7/21/2028
            DateTimeFormatter.ofPattern("d-M-yyyy"), // 21-7-2028
            DateTimeFormatter.ofPattern("M-d-yyyy"), // 7-21-2028
            DateTimeFormatter.ofPattern("yyyy/M/d"), // 2028/7/21
            DateTimeFormatter.ofPattern("yyyy-M-d"), // 2028-7-21
            DateTimeFormatter.ISO_INSTANT); // 2028-07-21T00:00:00Z

    @Override
    public Instant deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();

        if (value == null || value.trim().isEmpty())
            return null;

        // Check for d/M or d-M (day/month, set current year)
        if (value.matches("\\d{1,2}[/-]\\d{1,2}")) {
            try {
                String[] parts = value.split("[/-]");
                int day = Integer.parseInt(parts[0]);
                int month = Integer.parseInt(parts[1]);
                int year = Year.now().getValue();
                LocalDate date = LocalDate.of(year, month, day);

                return date.atStartOfDay().toInstant(ZoneOffset.UTC);
            } catch (Exception e) {
                // Fall through to other formats
            }
        }

        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                if (formatter == DateTimeFormatter.ISO_INSTANT) {
                    return Instant.parse(value);
                } else {
                    LocalDate date = LocalDate.parse(value, formatter);
                    return date.atStartOfDay().toInstant(ZoneOffset.UTC);
                }
            } catch (DateTimeParseException e) {
            }
        }
        throw new IOException("Invalid date format: " + value
                + ". Supported: d/M/yyyy, M/d/yyyy, d-M-yyyy, M-d-yyyy, yyyy/M/d, yyyy-M-d, d/M, d-M, ISO 8601.");
    }

    // Static method to parse Instant from string (for use in controllers)
    public static Instant parseInstant(String value) throws IOException {
        if (value == null || value.trim().isEmpty())
            return null;

        // Check for d/M or d-M (day/month, set current year)
        if (value.matches("\\d{1,2}[/-]\\d{1,2}")) {
            try {
                String[] parts = value.split("[/-]");
                int day = Integer.parseInt(parts[0]);
                int month = Integer.parseInt(parts[1]);
                int year = Year.now().getValue();
                LocalDate date = LocalDate.of(year, month, day);

                return date.atStartOfDay().toInstant(ZoneOffset.UTC);
            } catch (Exception e) {
                // Fall through to other formats
            }
        }

        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                if (formatter == DateTimeFormatter.ISO_INSTANT) {
                    return Instant.parse(value);
                } else {
                    LocalDate date = LocalDate.parse(value, formatter);

                    return date.atStartOfDay().toInstant(ZoneOffset.UTC);
                }
            } catch (DateTimeParseException e) {
            }
        }
        throw new IOException("Invalid date format: " + value
                + ". Supported: d/M/yyyy, M/d/yyyy, d-M-yyyy, M-d-yyyy, yyyy/M/d, yyyy-M-d, d/M, d-M, ISO 8601.");
    }
}