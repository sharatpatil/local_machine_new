USE [test]
GO

INSERT INTO [dbo].[Config]
           ([parameter_name]
           ,[upper_limit]
           ,[lower_limit]
           ,[createdAt]
           ,[updatedAt]
           ,[part_number])
     VALUES
           (<parameter_name, nvarchar(255),>
           ,<upper_limit, decimal(10,4),>
           ,<lower_limit, decimal(10,4),>
           ,<createdAt, datetime,>
           ,<updatedAt, datetime,>
           ,<part_number, nvarchar(255),>)
GO


