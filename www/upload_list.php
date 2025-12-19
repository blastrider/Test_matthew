<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$uploadDir = __DIR__ . '/upload';

if (!is_dir($uploadDir)) {
    echo json_encode(['ok' => true, 'items' => []]);
    exit;
}

$handle = opendir($uploadDir);
if ($handle === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Cannot open upload directory.']);
    exit;
}

$items = [];
while (($entry = readdir($handle)) !== false) {
    if ($entry === '.' || $entry === '..') {
        continue;
    }
    if ($entry[0] === '.') {
        continue;
    }

    $path = $uploadDir . '/' . $entry;
    if (!is_file($path)) {
        continue;
    }

    $ext = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
    if ($ext !== 'pdf') {
        continue;
    }

    $size = filesize($path);
    $mtime = filemtime($path);

    $items[] = [
        'name' => $entry,
        'size' => $size === false ? 0 : $size,
        'mtime' => $mtime === false ? 0 : $mtime,
        'url' => '/upload/' . rawurlencode($entry),
    ];
}

closedir($handle);

usort($items, function ($a, $b) {
    return ($b['mtime'] ?? 0) <=> ($a['mtime'] ?? 0);
});

echo json_encode(['ok' => true, 'items' => $items]);
