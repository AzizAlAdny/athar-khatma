<?php

namespace App\Mail\Transport;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;

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
        Log::info('BrevoTransport doSend initiated');
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        try {
            $payload = $this->getPayload($email);

            Log::info('Brevo API Sending Request', [
                'to' => array_column($payload['to'], 'email'),
                'sender' => $payload['sender']['email'] ?? 'unknown',
                'subject' => $payload['subject'] ?? 'no subject',
            ]);

            $response = $this->client->request('POST', 'https://api.brevo.com/v3/smtp/email', [
                'headers' => [
                    'api-key' => $this->key,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => $payload,
            ]);

            Log::info('Brevo API Success', [
                'status' => $response->getStatusCode(),
                'body' => (string) $response->getBody(),
            ]);
        } catch (GuzzleException $e) {
            $errorResponse = 'No response body';
            if (method_exists($e, 'hasResponse') && $e->hasResponse()) {
                $errorResponse = (string) $e->getResponse()->getBody();
            }

            Log::error('Brevo API Error', [
                'message' => $e->getMessage(),
                'response' => $errorResponse,
            ]);
            throw $e;
        }
    }

    /**
     * Get the HTTP payload for the Brevo API request.
     *
     * @param  \Symfony\Component\Mime\Email  $email
     * @return array
     */
    protected function getPayload(Email $email): array
    {
        $from = $email->getFrom()[0] ?? new Address(config('mail.from.address'), config('mail.from.name'));

        $payload = [
            'sender' => [
                'name' => $from->getName() ?: config('mail.from.name'),
                'email' => $from->getAddress(),
            ],
            'to' => $this->mapAddresses($email->getTo()),
            'subject' => $email->getSubject(),
        ];

        if ($html = $email->getHtmlBody()) {
            $payload['htmlContent'] = is_resource($html) ? stream_get_contents($html) : $html;
        }

        if ($text = $email->getTextBody()) {
            $payload['textContent'] = is_resource($text) ? stream_get_contents($text) : $text;
        }

        if ($cc = $email->getCc()) {
            $payload['cc'] = $this->mapAddresses($cc);
        }

        if ($bcc = $email->getBcc()) {
            $payload['bcc'] = $this->mapAddresses($bcc);
        }

        if ($replyTo = $email->getReplyTo()) {
            $payload['replyTo'] = $this->mapAddresses($replyTo)[0] ?? null;
        }

        // Attachments
        if ($attachments = $email->getAttachments()) {
            $payload['attachment'] = [];
            foreach ($attachments as $attachment) {
                $payload['attachment'][] = [
                    'name' => $attachment->getPreparedHeaders()->getHeaderParameter('Content-Disposition', 'filename') ?: 'attachment',
                    'content' => base64_encode($attachment->getBody()),
                ];
            }
        }

        return $payload;
    }

    /**
     * Map Symfony Mime addresses to Brevo API format.
     *
     * @param  array  $addresses
     * @return array
     */
    protected function mapAddresses(array $addresses): array
    {
        return array_map(function (Address $address) {
            return array_filter([
                'name' => $address->getName() ?: null,
                'email' => $address->getAddress(),
            ]);
        }, $addresses);
    }

    /**
     * Get the string representation of the transport.
     */
    public function __toString(): string
    {
        return 'brevo';
    }
}
