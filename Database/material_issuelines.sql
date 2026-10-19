
CREATE TABLE dbo.MaterialIssueLines
(
    IssueLineID INT IDENTITY(1,1) PRIMARY KEY,
    IssueID INT NOT NULL,
    MaterialID INT NOT NULL,
    IssueQuantity DECIMAL(18,3) NOT NULL,
    Notes NVARCHAR(250) NULL,

    CONSTRAINT FK_IssueLine_Issue
        FOREIGN KEY (IssueID)
        REFERENCES dbo.MaterialIssues(IssueID),

    CONSTRAINT FK_IssueLine_Material
        FOREIGN KEY (MaterialID)
        REFERENCES dbo.Materials(MaterialID),

    CONSTRAINT CK_IssueLine_Quantity
        CHECK (IssueQuantity > 0)
);
GO