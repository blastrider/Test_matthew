<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$uploadDir = __DIR__ . '/uploads';
$maxBytes = 10 * 1024 * 1024;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Methode non autorisee.']);
    exit;
}

if (!isset($_FILES['pdf'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Fichier manquant.']);
    exit;
}

$file = $_FILES['pdf'];

if (!is_array($file) || !isset($file['error'], $file['tmp_name'], $file['name'], $file['size'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Charge utile invalide.']);
    exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    $message = 'Erreur lors de l\'upload.';
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        $message = 'Fichier trop volumineux.';
    }
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

if ($file['size'] > $maxBytes) {
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'Fichier trop volumineux.']);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if ($mime !== 'application/pdf') {
    http_response_code(415);
    echo json_encode(['ok' => false, 'error' => 'Seuls les PDF sont autorises.']);
    exit;
}

$original = basename($file['name']);
$sanitized = preg_replace('/[^A-Za-z0-9._-]/', '_', $original);
if ($sanitized === '' || $sanitized === '.' || $sanitized === '..') {
    $sanitized = 'document.pdf';
}

$extension = strtolower(pathinfo($sanitized, PATHINFO_EXTENSION));
if ($extension !== 'pdf') {
    $sanitized .= '.pdf';
}

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Dossier de destination indisponible.']);
        exit;
    }
}

$baseName = pathinfo($sanitized, PATHINFO_FILENAME);
$targetName = $sanitized;
$counter = 1;
$targetPath = $uploadDir . '/' . $targetName;
while (file_exists($targetPath)) {
    $targetName = $baseName . '-' . $counter . '.pdf';
    $targetPath = $uploadDir . '/' . $targetName;
    $counter += 1;
}

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Echec de l\'enregistrement.']);
    exit;
}

echo json_encode([
    'ok' => true,
    'filename' => $targetName,
    'url' => '/uploads/' . $targetName,
]);
