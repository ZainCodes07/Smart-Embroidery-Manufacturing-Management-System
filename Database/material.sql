CREATE TABLE dbo.Materials
(
    MaterialID INT IDENTITY(1,1) PRIMARY KEY,
    MaterialName NVARCHAR(100) NOT NULL,
    Variant NVARCHAR(100) NOT NULL DEFAULT N'',
    Category NVARCHAR(50) NOT NULL,
    BaseUnit NVARCHAR(20) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT UQ_Material_Name_Variant
        UNIQUE (MaterialName, Variant),

    CONSTRAINT CK_Material_BaseUnit
        CHECK (BaseUnit IN
        (N'CONE', N'ROLL', N'PIECE', N'KG', N'LITER'))
);
GO
