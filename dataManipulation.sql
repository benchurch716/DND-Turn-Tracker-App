--Queries for add/delete/update functionality will contain the ? character where user input is required.
--CHARACTERS PAGE
--Display all characters
SELECT * FROM Characters

--Add a new character
INSERT INTO Characters (name, initiativeBonus, playerCharacter, hostileToPlayer) VALUES (?name, ?initiativeBonus, ?playerCharacter, ?hostileToPlayer)

--Delete a character
DELETE FROM Characters WHERE charID=?charID

--Update a character
UPDATE Characters SET name=?name, initiativeBonus=?initiativeBonus, playerCharacter=?playerCharacter, hostileToPlayer=?hostileToPlayer


--CONDITIONS PAGE
--Display all conditions
SELECT * FROM Conditions

--Add a new condition
INSERT INTO Conditions (name, effect) VALUES (?name, ?effect)

--Delete a condition
DELETE FROM Conditions WHERE conID=?conID

--Update a condition
UPDATE Conditions SET name=?name, effect=?effect


--ITEMS PAGE
--Display all items
SELECT * FROM Items

--Add an new item
INSERT INTO Items (name, effect, type, quantity, isMagic) VALUES (?name, ?effect, ?type, ?quantity, ?isMagic)

--Delete an item
DELETE FROM Items WHERE itemID=?itemID

--Update an item
UPDATE Items SET name=?name, type=?type, quantity=?quantity, effect=?effect, isMagic=?isMagic


--ENCOUNTERS PAGE
--Display all encounters
SELECT * FROM Encounters

--Add an new encounter
INSERT INTO Encounters (round, setting) VALUES (?round, ?setting)

--Delete an encounter
DELETE FROM Encounters WHERE enID=?enID

--Update an encounter
UPDATE Encounters SET round=?round, setting=?setting


--CHARACTER DETAILS PAGE
--Display all conditions and items for the selected character
SELECT charID, name FROM Characters --allows the user to select a character from a dropdown list
SELECT name FROM Characters WHERE charID=?charID --displays the selected character's name on the page
SELECT con.conID, con.name, con.effect 
    FROM Conditions con 
    INNER JOIN Conditions_Characters cc 
    ON con.conID = cc.conID 
    WHERE charID = ?charID --displays the conditions for the selected character
SELECT i.itemID, i.name, i.type, i.quantity, i.effect, i.isMagic 
    FROM Items i 
    WHERE i.heldBy = ?charID --displays the items for the selected character

--Add a new condition or item to the selected character
SELECT con.name, con.conID FROM Conditions con 
    WHERE con.conID NOT IN 
        (SELECT con.conID FROM Conditions con 
        JOIN Conditions_Characters cc ON con.conID = cc.conID 
        WHERE cc.charID = ?charID) --allows the user to select another condition from a dropdown list to add to the selected character
INSERT INTO Conditions_Characters (conID, charID) VALUES (?conID, ?charID) --adds a character-condition relationship
SELECT i.name, i.itemID FROM Items i 
    WHERE i.itemID NOT IN 
        (SELECT itemID FROM Items 
        WHERE heldBy = ?charID) --allows the user to select another item from a dropdown list to add to the selected character
UPDATE Items SET heldBy=?charID WHERE itemID=?itemID --links the selected item to the selected character

--Delete a condition or item from the selected character
DELETE FROM Conditions_Characters WHERE conID=?conID and charID=?charID --deletes a character-condition relationship
UPDATE Items SET heldBy=NULL WHERE itemID=?itemID --removes the selected item from the selected character


--TURN ORDER PAGE
--Display all characters involved in the selected encounter
SELECT enID FROM Encounters --allows the user to select an encouter from a dropdown list
SELECT c.charID, c.name, c.playerCharacter, c.hostileToPlayer, ec.initiativeTotal, con.name conName 
    FROM Characters c 
    JOIN Encounters_Characters ec 
    ON c.charID = ec.charID 
    LEFT JOIN Conditions_Characters cc 
    ON cc.charID = c.charID 
    LEFT JOIN Conditions con 
    ON con.conID = cc.conID 
    WHERE enID = ?enID

--Add a new character to the selected encounter
SELECT c.name, c.charID, c.initiativeBonus FROM Characters c 
    WHERE c.charID NOT IN 
        (SELECT c.charID FROM Characters c 
        JOIN Encounters_Characters ec ON c.charID = ec.charID 
        WHERE ec.enID = ?enID) --allows the user to select another character from a dropdown list to add to the selected encouter
SELECT initiativeBonus FROM Characters WHERE charID=?charID --a character's initiative bonus + dice roll = initiative total (determines turn order)
INSERT INTO Encounters_Characters (enID, charID, initiativeTotal) VALUES (?enID, ?charID, ?initiativeBonus+diceRoll)

--Delete a character from the selected encounter
DELETE FROM Encounters_Characters WHERE charID=?charID and enID=?enID