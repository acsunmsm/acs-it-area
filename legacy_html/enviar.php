<?php
// Keep the legacy form URL while using the same validated contact handler.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    exit;
}

header('Location: /api/contact', true, 307);
exit;
