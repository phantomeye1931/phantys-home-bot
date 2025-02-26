import * as database from "#src/modules/database";
import * as skinForm from "#src/functions/skinFormHandler";
import * as logs from "#src/modules/logs";
import {getGuild, getRoleUsers} from "#src/modules/discord";

// /* private */ async function getBoosters(phGuild) {
//     await phGuild.members.fetch(); // Fetch and cache server members
//
//     const boosterRoleID = process.env.BOOSTER_ROLE_ID;
//     const boosterRole = await phGuild?.roles?.fetch(boosterRoleID); // Get Booster role
//     const boosters = await boosterRole?.members.map(m=>m.user.id); // Get IDs of all Boosters
//
//     return boosters;
// }

async function incrementAndDM() {
    try {
        let phGuild = await getGuild();
        let boosters = await getRoleUsers(process.env.BOOSTER_ROLE_ID);

        // Incrementing boosters
        let successes = 0;
        console.log("Updating boosting days for", boosters);

        for (const boosterId of boosters) {
            const result = await database.incBoostingDay(boosterId);
            if (result) successes++;
        }

        await logs.logMessage(`✅ Incremented boosting days for ${successes} members.`);

        // Form DM'ing
        const boosted = await database.getBoosted(90); // Get list of IDs that have boosted 3 months

        for (let i = 0; i < boosted.length; i++) {
            const targetBooster = await phGuild.members.fetch(boosted[i]);
            console.log(
                targetBooster.user.username,
                "has boosted for 90 days, DMing them!");

            await skinForm.sendFormMessage(targetBooster, 0);
        }

    } catch (error) {
        await logs.logError("incrementing boosters", error);
    }
}

export default { incrementAndDM };
