
CREATE TABLE dbo.MaterialReceipts
(
    ReceiptID INT IDENTITY(1,1) PRIMARY KEY,
    ReceiptDate DATE NOT NULL,
    ReceiptType NVARCHAR(10) NOT NULL,
    SupplierID INT NULL,
    BillNumber NVARCHAR(50) NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Receipt_Supplier
        FOREIGN KEY (SupplierID)
        REFERENCES dbo.Suppliers(SupplierID),

    CONSTRAINT CK_Receipt_Type
        CHECK (ReceiptType IN (N'OPENING', N'PURCHASE')),

    CONSTRAINT CK_Opening_NoSupplier
        CHECK (ReceiptType <> N'OPENING' OR SupplierID IS NULL),

    CONSTRAINT CK_Purchase_HasSupplier
        CHECK (ReceiptType <> N'PURCHASE' OR SupplierID IS NOT NULL)
);
GO
