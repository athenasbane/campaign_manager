import { SessionType } from "Types/Enum/sessions.enum";
import { TSession } from "Types/Types/session.type";

export const sessions: TSession[] = [
  {
    type: SessionType.StoryIncrement,
    increment: "act",
    displayLabel: "Act I",
  },
  {
    type: SessionType.StoryIncrement,
    increment: "chapter",
    displayLabel: "Chapter 1",
  },
  {
    type: SessionType.Location,
    displayLabel: "The Shambles, The Nals",
  },
  {
    sessionNo: 1,
    type: SessionType.Session,
    location: "The Shambles, The Nals",
    inGameEndTime: "N/A",
    shortDescription: "The Journey Begins",
    longDescription: `- Joined together
    - Completed the Clearing of Shelmark
      - The Party found the body of Franzi they were going to give it to Luka but Balfor intuited that it maybe worth something to someone. Gormar's sword seemed attracted to her then when it touched the head with the pomel a helm appeared Gormar put it on and it disappeared.
      - The party still have her armour.
    - The gang stayed in a in the The Half-full Chalice. Karlyle hooked up with Metha but due a poor performance she left before he woke.
    - The gang then met with Rosalina
      - she's told then that the transport to the wastes will be at Southver Flats in the morning.
      - Dick stole 5CP of the Reward money.
      - She mentioned her husband died by goblins recently in Hiranemount.`,
  },
  {
    sessionNo: 2,
    type: SessionType.Session,
    location: "The Shambles, The Nals",
    inGameEndTime: "N/A",
    shortDescription: "Wading in the Wastes",
    longDescription: `- travelled into the wastes on board the feather
    - Were attacked by goblins and hobgoblins
        - Both Balfor and karlyle downed but Quick thinking from Dick and Balfor respectively saved their lives.
    - Met a Lizardfolk monk that spoke to Dick let him know that Kelzis is likely to the North In Thorpeness where his father ‘The Amassador’ was last.
        - She directed you too the new village to find Samual. There you engaged with the villagers that seemed slightly changed.
    - After killing them, or “helping them” for Dick, you engaged with a mutated lizardfolk sharman.
    - in his lair you found
        - an old map that listed the current location as “The Hall of Hirane and Avanker” the formal name for the Inquisition
        - A spell book written in both Dragonic and Abysal that was some sort of instructions for summoning.
        - A section of a personal journal that had two things repeated:
            - I will be come one with them, them with me, my people will come, all will be one.
            - Pergash bound, the path is laid. The take the stones from the glade.
    - a young boy in a cage called Samuel
        - A PseudoDragon that Balfour took as a familiar.`,
  },
  {
    sessionNo: 3,
    type: SessionType.Session,
    location: "The Shambles, The Nals",
    inGameEndTime: "N/A",
    shortDescription: "Inker Investigation",
    longDescription: `- came from the wastes
    - Attacked by a large monster The Feather damaged
    - Went back to The Shambles spoke to Thorsten went on a mission to get Georg Inkers ledger, was successful, got the reward.
    - Went back to Vandrad she give you a new mission
        - You each have a promption in imperial alignment.
        - Also let the mother of Franzi know that you have information out her.
    
    **Vandrads mission:**
    
    - As you no doubt have gathered by now I have a personal interest in lost things… A young and promising enchanter by the name of Bolli Purlic.
    - After studying hard here in Old Shamphel he was offered a very good job for a master artisian in Thorpness.
    - The boy seems head strong, managed to avoid any of the nasty drug business the youth of rich seem to be interested in these days and was making a name for himself as a rising star in the enchanting circles.
    - He left that job a few months ago and has not been heard from since. This sudden leaving seems to have coincided with the rise of an Unaligned Group that call themselves “The Raven” that have been conducting raids on Taxation vessels coming from the north
    - We believe that Purlic has some how got mixed up in this. We intercepted an agent of The Raven, here in Shamphel, a nasty little man by the name of Ceolmon. He had a note from Purlic:
        
        
        Ceolmon, 
        
        It seems our usual ways of communication are being intercepted some how so this is a matter of last resort. Please send aid in the form of people we can trust to Thorpness. This is a tricky situation so please take your time in picking the right ones. 
        
        I'll be in the usual place every morning first light doing my usual activity. 
        
        *Bolli*
        
    
    - From what we know Purlic is enjoys to paint we suspect this is the “Usual Activity” that he describes.
    - The usual place from some of his previous works:
        - Shows very well painted scenes all from above of people in motion.
    - It seems that he has a particular subject he prefers.
    
    **Your mission:**
    
    - Go undercover as the support requested from Purlic. Work with him to understand his involvement with The Raven. Gain an understanding of their organisation.
    - I cannot stress enough that no harm must come to Purlic… He is to be protected.
    - However, once you have had enough time to assess the situation you should try to convince him to return to us here. If you can do that of his own accord that would be preferable. However, if this cannot be done other than force please return with the information only.
    
    Reward:
    
    - For successful gaining of information I will award you:
        - 100… PC… each…
        - If you convince him to return here a further 50PC will be granted.
    
    Logistics: 
    
    - You will meet the Southver boat crew at the Southver flatts they will go to Kilcathness for some necessary repairs they need to do to their ship. Once complete you will continue on to Thorpeness and your mission.`,
  },
  {
    type: SessionType.StoryIncrement,
    increment: "chapter",
    displayLabel: "Chapter 2",
  },
  {
    type: SessionType.Location,
    displayLabel: "Klilcaithness, The Nals",
  },
  {
    type: SessionType.Session,
    sessionNo: 4,
    location: "Klilcaithness",
    inGameEndTime: "21:00",
    shortDescription: "Welcome to Klilcaithness",
    longDescription: `- Spoke to Hidii Grunbumn about franzi she gave you a reward for letting her know.
    - went aboard the feather still damaged from the dinosaur attack to klilcaithness
    - Got to klilcaith bought somethings at the Griffin enchanting services
        - Was told that they sell less than legal magic items out the back of the shop by someone who speaks thieves cant Druggen
    - Went to the brewery and was told that they had to increase the price of their ale due to their barley supplier stopping growing barley and the owners of the farm going missing
    - Manticore and 5gp per set of ears of gobilins
    - They “bought” some horses, a cart and headed off you where attacked by knolls then went to the farm house.
    - First you saw a boy that's under the influence of quinine working and carrying produce of a strange flowering plant
    - then you met a young woman who due to a natural 20 perception check from Karlyle he noticed this young woman wasn't what she seemed.
    - You defeated them and found a note.
        
        Production is lower than expected make sure you make up the difference.
        
        Lamuin 
        
    - you also noticed there was 4 glasses of blood.`,
  },
  {
    type: SessionType.Session,
    sessionNo: 5,
    location: "Klilcaithness",
    inGameEndTime: "N/A",
    shortDescription: "Action in the Ashglade",
    longDescription: `- Killed the remaining vampire spawn at the ashglade and pearson farms.
    - Was told that Ulric will release the rest of his Bailey stores to the ness brewery.
    - Went north met with some gobs killed them.
    - Then was tricked by a cowboy dwarf
    - It was lamia that was revealed and attempted to call a Manticore to him.
    - You killed the lamia then the manticore and raided the Lamia’s lair that was a strange scaled up hall.
    - You found an injured real Gizmug in the lair. He told you that it’s “The Collector” that wants the magical beasts. He used a scroll to cross off the Manticore and an elf appeared he “introduced” himself as Elromior he paid you for both the Manticore and the Lamia.`,
  },
  {
    type: SessionType.Session,
    sessionNo: 6,
    location: "Klilcaithness",
    inGameEndTime: "15:00",
    shortDescription: "Killing in the name of Krig",
    longDescription: `- Completed the Nessy Brewery mission and levelled up. 
    - Sold and bought a load of stuff including the brazer 
    - Went to the university and learnt a lot on various subjects 
    - Spoke to Heik the feather is ready but you can leave when you want. 
    - Fought in the Fighting Pits of Krig managed to get to the get to the 5th Round and tied with the Fate’s Fortune who you met there.
    `,
  },
];
