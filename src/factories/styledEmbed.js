import {EmbedBuilder, MessageFlags} from "discord.js";
import colors from "#src/consts/colors";
import {icons} from "#src/consts/icons";

/**
 * Generates a styled Embed.
 * @param body Body text of the Embed.
 * @param footer Footer text of the Embed, excluding the timestamp.
 * @param title The title of the Embed.
 * @param color The color of the Embed, <code>colors.Primary</code> by default.
 * @param fields Column fields of the Embed.
 * @param thumbnail Image URL.
 * @returns An Embed object
 */
export function embedObject(body, footer, title, color = colors.Primary, thumbnail = null, fields = []) {
    const isPortalModEmbed = title.includes("PortalMod");
    const formTitle = { 
        name: title, 
        iconURL: isPortalModEmbed ? icons.portalmod : icons.home
    };

    let embed = new EmbedBuilder()
        .setColor(color);

    if (title  !== "") embed.setAuthor(formTitle);
    if (body   !== "") embed.setDescription(body);
    if (footer !== "") {
        embed.setFooter({text: footer});
        embed.setTimestamp();
    }

    if (thumbnail !== "") embed.setThumbnail(thumbnail);
    if (fields.length > 0) embed.addFields(...fields);

    return embed;
}
/**
 * Generates a message with a styled Embed.
 * @param body Body text of the Embed.
 * @param footer Footer text of the Embed, excluding the timestamp.
 * @param title The title of the Embed.
 * @param color The color of the Embed, <code>colors.Primary</code> by default.
 * @param ephemeral Whether the Embed should only be visible to this user, <code>false</code> by default.
 * @param fields Column fields of the Embed.
 * @param thumbnail Image URL.
 * @returns A message object that can directly be used with <code>.send</code> and <code>.reply</code>.
 */
export function embedMessageObject(body, footer, title, color = colors.Primary, ephemeral = false, thumbnail = "", fields = []) {

    return { embeds: [ embedObject(body, footer, title, color, thumbnail, fields) ],
        ...(ephemeral && {flags: MessageFlags.Ephemeral })
    };
}