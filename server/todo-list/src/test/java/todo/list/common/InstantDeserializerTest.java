package todo.list.common;

import org.junit.jupiter.api.Test;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

public class InstantDeserializerTest {

    @Test
    void testParseInstantValidDate() throws IOException {
        Instant result = InstantDeserializer.parseInstant("2023-07-21");
        Instant expected = LocalDate.of(2023, 7, 21).atStartOfDay().toInstant(ZoneOffset.UTC);

        assertEquals(expected, result);
    }

    @Test
    void testParseInstantDayMonth() throws IOException {
        Instant result = InstantDeserializer.parseInstant("21/7");
        LocalDate expectedDate = LocalDate.of(java.time.Year.now().getValue(), 7, 21);
        Instant expected = expectedDate.atStartOfDay().toInstant(ZoneOffset.UTC);

        assertEquals(expected, result);
    }

    @Test
    void testParseInstantISO() throws IOException {
        Instant result = InstantDeserializer.parseInstant("2023-07-21T00:00:00Z");
        Instant expected = Instant.parse("2023-07-21T00:00:00Z");

        assertEquals(expected, result);
    }

    @Test
    void testParseInstantInvalid() {
        Exception exception = assertThrows(IOException.class, () -> {
            InstantDeserializer.parseInstant("invalid-date");
        });

        assertTrue(exception.getMessage().contains("Invalid date format"));
    }

    @Test
    void testParseInstantNull() throws IOException {
        Instant result = InstantDeserializer.parseInstant(null);

        assertNull(result);
    }
}
