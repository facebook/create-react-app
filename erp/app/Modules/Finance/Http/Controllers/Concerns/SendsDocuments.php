<?php

namespace App\Modules\Finance\Http\Controllers\Concerns;

use App\Modules\Finance\Mail\DocumentMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

trait SendsDocuments
{
    private function renderDocumentPdf(string $view, array $data): string
    {
        return Pdf::loadView($view, $data)->output();
    }

    private function resolveCompanyName(): string
    {
        try {
            return app('tenant')->name;
        } catch (\Throwable) {
            return config('app.name', 'ERP');
        }
    }

    private function sendDocumentEmail(
        Request $request,
        string $toEmail,
        string $subject,
        string $pdfData,
        string $filename,
    ): void {
        $company     = $this->resolveCompanyName();
        $messageBody = $request->input('message', '');

        Mail::to($toEmail)->send(new DocumentMail(
            mailSubject: $subject,
            pdfData:     $pdfData,
            filename:    $filename,
            company:     $company,
            messageBody: $messageBody,
        ));
    }
}
