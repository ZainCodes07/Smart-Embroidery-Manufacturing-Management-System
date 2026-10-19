
CREATE TABLE dbo.Designs
(
    DesignID INT IDENTITY(1,1) PRIMARY KEY,
    PartyCode NVARCHAR(2) NOT NULL,
    DesignNumber NVARCHAR(30) NOT NULL,
    DesignCode AS
        (PartyCode + N'-' + DesignNumber) PERSISTED,
    Description NVARCHAR(250) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT UQ_Design_Party_Number
        UNIQUE (PartyCode, DesignNumber),

    CONSTRAINT CK_Design_Party
        CHECK (PartyCode IN (N'SH', N'AB', N'D'))
);
GO