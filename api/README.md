# NiyalGPT XAMPP Gemini API

This folder lets the root `index.html` talk to Gemini through XAMPP/PHP.

## Setup

1. Copy:

```text
api/config.example.php
```

to:

```text
api/config.php
```

2. Paste your Gemini key:

```php
return [
    'gemini_api_key' => 'YOUR_REAL_GEMINI_API_KEY',
    'gemini_model' => 'gemini-2.5-flash'
];
```

3. Start Apache in XAMPP.

4. Open:

```text
http://localhost/NiyalGpt/
```

Do not open the file with `file:///...` when using the PHP API. It must run through Apache.
