
CREATE TABLE dbo.MaterialReceiptLines
(
    ReceiptLineID INT IDENTITY(1,1) PRIMARY KEY,
    ReceiptID INT NOT NULL,
    MaterialID INT NOT NULL,

    PurchaseQuantity DECIMAL(18,3) NOT NULL,
    PurchaseUnit NVARCHAR(20) NOT NULL,
    ConversionFactor DECIMAL(18,3) NOT NULL DEFAULT 1,

    UnitRate DECIMAL(18,2) NOT NULL,

    BaseQuantity AS
        CONVERT(DECIMAL(18,3),
            PurchaseQuantity * ConversionFactor) PERSISTED,

    LineTotal AS
        CONVERT(DECIMAL(18,2),
            PurchaseQuantity * UnitRate) PERSISTED,

    Notes NVARCHAR(250) NULL,

    CONSTRAINT FK_ReceiptLine_Receipt
        FOREIGN KEY (ReceiptID)
        REFERENCES dbo.MaterialReceipts(ReceiptID),

    CONSTRAINT FK_ReceiptLine_Material
        FOREIGN KEY (MaterialID)
        REFERENCES dbo.Materials(MaterialID),

    CONSTRAINT CK_ReceiptLine_Quantity
        CHECK (PurchaseQuantity > 0),

    CONSTRAINT CK_ReceiptLine_Conversion
        CHECK (ConversionFactor > 0),

    CONSTRAINT CK_ReceiptLine_Rate
        CHECK (UnitRate >= 0),

    CONSTRAINT CK_ReceiptLine_Unit
        CHECK (PurchaseUnit IN
        (N'CONE', N'ROLL', N'PACKET', N'PIECE', N'KG', N'LITER'))
);
GO