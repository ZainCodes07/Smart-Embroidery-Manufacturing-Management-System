
CREATE TABLE dbo.ProductionShifts
(
    ProductionShiftID INT IDENTITY(1,1) PRIMARY KEY,
    MachineID INT NOT NULL,
    ShiftDate DATE NOT NULL,
    ShiftType NVARCHAR(5) NOT NULL,
    Notes NVARCHAR(250) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Shift_Machine
        FOREIGN KEY (MachineID)
        REFERENCES dbo.Machines(MachineID),

    CONSTRAINT UQ_Machine_Date_Shift
        UNIQUE (MachineID, ShiftDate, ShiftType),

    CONSTRAINT CK_Shift_Type
        CHECK (ShiftType IN (N'DAY', N'NIGHT'))
);
GO
