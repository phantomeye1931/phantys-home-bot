import { getClient } from "#src/modules/client.mts";
import {guildID} from "#src/consts/phantys_home.mts";
import {flags, setFlag} from "#src/agents/flagAgent.mts";
import { Guild } from "discord.js";

let phantys_home: Guild;

/* private */ async function init() {
    const client = await getClient();

    phantys_home = await client.guilds.fetch(guildID);

    await phantys_home.channels.fetch();
    await phantys_home.members.fetch();
}

await init();

export function getGuild() {
    return phantys_home;
}

export async function getMember(id: string) {
    const cachedUser = phantys_home.members.cache.get(id);

    if (cachedUser) return cachedUser;

    try {
        return await phantys_home.members.fetch(id);
    } catch {
        setFlag(id, flags.Ghost);
        return undefined;
    }
}

export async function getChannel(id: string) {
    const cachedChannel = phantys_home.channels.cache.get(id);

    if (cachedChannel) return cachedChannel;

    try {
        return await phantys_home.channels.fetch(id);
    } catch {
        return undefined;
    }
}

export async function getRoleUsers(id: string): Promise<string[] | null> {
    await phantys_home.members.fetch(); // Ensure all members are cached (#3)
    const role = await phantys_home.roles.fetch(id);

    if (!role) return null;

    return role.members.map(member => member.user.id); // TODO: This mapping shouldn't occur here, but rather at usages that need it in this format.
}