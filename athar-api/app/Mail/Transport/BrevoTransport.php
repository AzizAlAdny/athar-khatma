<?php

namespace App\Mail\Transport;

use GuzzleHttp\ClientInterface;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;
use Symfony\Component\Mime\Email;

class BrevoTransport extends AbstractTransport
{
    /**
     * Guzzle client instance.
     *
     * @var \GuzzleHttp\ClientInterface
     */
    protected $client;

    /**
     * The Brevo API key.
     *
     * @var string
     */
    protected $key;

    /**
     * Create a new Brevo transport instance.
     *
     * @param  \GuzzleHttp\ClientInterface  $client
     * @param  string  $key
     * @return void
     */
    public function __construct(ClientInterface $client, string $key)
    {
        $this->client = $client;
        $this->key = $key;

        parent::__construct();
    }

    /**
     * {@inheritDoc}
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $this->client->request('POST', 'https://api.brevo.com/v3/smtp/email', [
            'headers' => [
                'api-key' => $this->key,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => $this->getPayload($email),
        ]);
    }

    /**
     * Get the HTTP payload for the Brevo API request.
     *
     * @param  \Symfony\Component\Mime\Email  $email
     * @return array
     */
    protected function getPayload(Email $email): array
    {
        $payload = [
            'sender' => [
                'name' => $email->getFrom()[0]->getName() ?: config('mail.from.name'),
                'email' => $email->getFrom()[0]->getAddress(),
            ],
            'to' => collect($email->getTo())->map(function ($address) {
                return [
                    'name' => $address->getName() ?: null,
                    'email' => $address->getAddress(),
                ];
            })->toArray(),
            'subject' => $email->getSubject(),
        ];

        if ($email->getHtmlBody()) {
            $payload['htmlContent'] = $email->getHtmlBody();
        }

        if ($email->getTextBody()) {
            $payload['textContent'] = $email->getTextBody();
        }

        return $payload;
    }

    /**
     * Get the string representation of the transport.
     */
    public function __toString(): string
    {
        return 'brevo';
    }
}
