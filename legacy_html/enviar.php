<?php
file_put_contents("log.txt", "PHP recibió la solicitud\n", FILE_APPEND);
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capturar el CAPTCHA
    $captcha = $_POST['g-recaptcha-response'];

    // Verificar si el usuario resolvió el CAPTCHA
    if (!$captcha) {
        header("Location: contact.html?status=captcha_error");
        exit();
    }

    // Validar el CAPTCHA con Google
    $secretKey = "6LfBVAYrAAAAAMapPShZyRoxbtbt2_ySOwVYPbs4"; // Reemplaza con tu clave secreta
    $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$captcha");
    $responseKeys = json_decode($response, true);

    if (!$responseKeys["success"]) {
        header("Location: contact.html?status=captcha_invalid");
        exit();
    }

    // Procesar el formulario si el CAPTCHA es válido
    $name = $_POST['name'];
    $mail = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    $header = "From: " . $mail . "\r\n";
    $header .= "Reply-To: " . $mail . "\r\n";
    $header .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $header .= "Mime-Version: 1.0\r\n";
    $header .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $fullMessage = "Este mensaje fue enviado por: " . $name . "\r\n";
    $fullMessage .= "Su e-mail es: " . $mail . "\r\n";
    $fullMessage .= "Asunto: " . $subject . "\r\n";
    $fullMessage .= "Mensaje: " . $message . "\r\n";
    $fullMessage .= "Enviado el: " . date('d/m/Y H:i:s', time());

    $para = 'secretary@acs-unmsm.org';
    $asunto = "Nuevo mensaje de contacto: " . $subject;

    if (mail($para, $asunto, utf8_decode($fullMessage), $header)) {
        header("Location: contact.html?status=success");
        exit();
    } else {
        header("Location: contact.html?status=error");
        exit();
    }
}
?>
