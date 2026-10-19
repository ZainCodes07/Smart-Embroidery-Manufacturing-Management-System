
CREATE TABLE dbo.Machines
(
    MachineID INT IDENTITY(1,1) PRIMARY KEY,
    MachineNumber INT NOT NULL UNIQUE,
    MachineName NVARCHAR(100) NULL,
    HeadCount INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CK_Machine_Number
        CHECK (MachineNumber > 0),

    CONSTRAINT CK_Machine_HeadCount
        CHECK (HeadCount > 0)
);
GO
