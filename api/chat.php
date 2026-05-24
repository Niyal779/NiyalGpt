<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Only POST requests are allowed.']);
    exit;
}

$configPath = __DIR__ . '/config.php';

if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Missing api/config.php. Copy api/config.example.php to api/config.php and add your Gemini API key.'
    ]);
    exit;
}

$config = require $configPath;
$apiKey = $config['gemini_api_key'] ?? '';
$model = $config['gemini_model'] ?? 'gemini-1.5-flash';

if (!$apiKey || $apiKey === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    http_response_code(500);
    echo json_encode(['message' => 'Gemini API key is not configured in api/config.php.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid JSON request body.']);
    exit;
}

$messages = $body['messages'] ?? [];
$personality = trim($body['personality'] ?? 'Helpful, clear, and professional.');

if (!is_array($messages) || count($messages) === 0) {
    http_response_code(400);
    echo json_encode(['message' => 'Messages are required.']);
    exit;
}

$contents = [];

foreach ($messages as $message) {
    $role = $message['role'] ?? '';
    $content = trim($message['content'] ?? '');

    if ($content === '' || !in_array($role, ['user', 'assistant'], true)) {
        continue;
    }

    $contents[] = [
        'role' => $role === 'assistant' ? 'model' : 'user',
        'parts' => [['text' => $content]]
    ];
}

if (count($contents) === 0) {
    http_response_code(400);
    echo json_encode(['message' => 'At least one user message is required.']);
    exit;
}

$payload = [
    'systemInstruction' => [
        'parts' => [[
            'text' => 'You are NiyalGPT, a real AI chatbot created for Niyal Rahaman. Follow this personality: ' . $personality
        ]]
    ],
    'contents' => $contents,
    'generationConfig' => [
        'temperature' => 0.85,
        'topP' => 0.95,
        'maxOutputTokens' => 2048
    ]
];

$url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent';
$ch = curl_init($url);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 45
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['message' => 'Could not connect to Gemini API: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($statusCode < 200 || $statusCode >= 300) {
    $message = $data['error']['message'] ?? 'Gemini API request failed.';
    http_response_code($statusCode ?: 502);
    echo json_encode(['message' => $message]);
    exit;
}

$parts = $data['candidates'][0]['content']['parts'] ?? [];
$reply = '';

foreach ($parts as $part) {
    $reply .= $part['text'] ?? '';
}

$reply = trim($reply);

if ($reply === '') {
    http_response_code(502);
    echo json_encode(['message' => 'Gemini returned an empty response.']);
    exit;
}

echo json_encode(['reply' => $reply]);
