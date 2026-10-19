
CREATE TABLE dbo.ProductionDetails
(
    ProductionDetailID INT IDENTITY(1,1) PRIMARY KEY,
    ProductionShiftID INT NOT NULL,
    DesignID INT NOT NULL,

    PartType NVARCHAR(10) NOT NULL,
    StitchCount BIGINT NOT NULL,
    MirrorCountPerHead INT NOT NULL DEFAULT 0,
    HeadCountUsed INT NOT NULL,

    TotalMirrors AS
        (MirrorCountPerHead * HeadCountUsed) PERSISTED,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Detail_Shift
        FOREIGN KEY (ProductionShiftID)
        REFERENCES dbo.ProductionShifts(ProductionShiftID),

    CONSTRAINT FK_Detail_Design
        FOREIGN KEY (DesignID)
        REFERENCES dbo.Designs(DesignID),

    CONSTRAINT UQ_Shift_Design_Part
        UNIQUE (ProductionShiftID, DesignID, PartType),

    CONSTRAINT CK_Detail_Part
        CHECK (PartType IN
        (N'FRONT', N'BACK', N'POCKET', N'TAKH',
         N'DUPATTA', N'SKIN', N'SHALWAR')),

    CONSTRAINT CK_Detail_Stitches
        CHECK (StitchCount >= 0),

    CONSTRAINT CK_Detail_Mirrors
        CHECK (MirrorCountPerHead >= 0),

    CONSTRAINT CK_Detail_Heads
        CHECK (HeadCountUsed > 0)
);
GO