package com.contentdiagnostics.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDto {
    private String id;
    private String type; // CARD or BANK
    private String lastFour;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String brand;
    private String bankName;
}
