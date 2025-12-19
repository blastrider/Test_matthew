<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

$payload = null;
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
}

$name = '';
if (is_array($payload) && isset($payload['name']) && is_string($payload['name'])) {
    $name = trim($payload['name']);
} elseif (isset($_POST['name']) && is_string($_POST['name'])) {
    $name = trim($_POST['name']);
}

if ($name === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing file name.']);
    exit;
}

if (basename($name) !== $name) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid file name.']);
    exit;
}

if (!preg_match('/\A[A-Za-z0-9._-]+\z/', $name)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid file name.']);
    exit;
}

$ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
if ($ext !== 'pdf') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Only PDF files can be deleted.']);
    exit;
}

$uploadDir = __DIR__ . '/upload';
$path = $uploadDir . '/' . $name;

if (!is_file($path)) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'File not found.']);
    exit;
}

if (!unlink($path)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to delete file.']);
    exit;
}

echo json_encode(['ok' => true]);
