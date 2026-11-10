package org.storestudio.store.controllers;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MediaUploadControllerTest {
    @Test void recognizesValidMedia() {
        assertEquals("image/jpeg", MediaUploadController.detectType(new byte[]{(byte)255,(byte)216,(byte)255,0}));
        assertEquals("image/png", MediaUploadController.detectType(new byte[]{(byte)137,80,78,71,13,10,26,10}));
        assertEquals("image/webp", MediaUploadController.detectType("RIFFxxxxWEBP".getBytes()));
        assertEquals("video/mp4", MediaUploadController.detectType("\0\0\0\0ftypxxxx".getBytes()));
        assertEquals("video/webm", MediaUploadController.detectType(new byte[]{0x1a,0x45,(byte)0xdf,(byte)0xa3}));
    }
    @Test void rejectsDangerousAndUnknownUploads() {
        assertNull(MediaUploadController.detectType("<svg><script>alert(1)</script></svg>".getBytes()));
        assertNull(MediaUploadController.detectType("<html>".getBytes()));
        assertNull(MediaUploadController.detectType(new byte[0]));
    }
}
