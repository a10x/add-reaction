/**
 * @name AddReaction
 * @author a10x
 * @description The plugin adds a way to quickly react to existing reactions. [README.md]{@link https://github.com/a10x/add-reaction/blob/main/README.md} for more details.
 * @version 0.0.1
 * @source https://github.com/a10x/add-reaction
 */

 const SendMessageModule = BdApi.findModuleByProps("sendMessage", "sendStickers");
 const MessageStore = BdApi.findModuleByProps("getMessage", "getMessages");
 const Permissions = BdApi.findModuleByProps("computePermissionsForRoles", "computePermissions");
 const PermissionConsts = BdApi.findModuleByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions;
 const UserStore = BdApi.findModuleByProps("getCurrentUser", "getUser");
 const ChannelStore = BdApi.findModuleByProps("getChannel", "getDMFromUserId")
 const ReactionModule = BdApi.findModuleByProps("addReaction", "removeAllReactions");

class Command {
	constructor(name, onUse){
		this.name = name;
		this.onUse = onUse;
		this.args = null;
	}
	get getName(){return this.name;}
	set setArgs(args){this.args = args;}
	get getArgs(){return this.args;}

	call(){if(this.onUse)this.onUse(this.args);}
}

class Commands{
	constructor(){this.commands = [];}
	
	get getCommands(){return this.commands;}
	addCommand(command){this.commands.push(command);}

	findCommand(text){		
		let spliceText = "";
		for(let i = text.length; i > 0 ; --i){
			spliceText = text.slice(0, i);
			for(let c of this.commands){
				if(spliceText === c.name){
					c.setArgs = text.slice(i, text.length);
					return c;
				}
			}
		}
		return null;
	}

	compileAndRunText(text){
		const foundCommand = this.findCommand(text);
		if(foundCommand){foundCommand.call();return true;
		}else return false;
	}
}

class AddReaction{
	start() {
		this.commands = new Commands();
		this.currentChannelId = null;
		this.addCommands();
		BdApi.Patcher.instead("AddReaction", SendMessageModule, "sendMessage", this.patchSendMessage.bind(this));
	}

	patchSendMessage(_, args, originalFunction){
		this.currentChannelId = args[0];
		if(!this.commands.compileAndRunText(args[1].content))originalFunction(...args);
	}

	getLastReactableMessage(messagesRange){
		const messages = MessageStore.getMessages(this.currentChannelId)._array;

		const checkPermission = Permissions.can({
			permission: PermissionConsts.ADD_REACTIONS,
			user: UserStore.getCurrentUser(),
			context: ChannelStore.getChannel(this.currentChannelId)
		});
		if(!checkPermission)return false;

		for(let i = messages.length-1; i >= messages.length-messagesRange; --i)
			if(messages[i].reactions.length > 0)return messages[i];
		
		return false;
	}

	addReaction(message, index=0){
		index = Math.min(message?.reactions.length-1, index);
		if(message.reactions[index].me)
			ReactionModule.removeReaction(message.channel_id, message.id, message.reactions[index].emoji);
		else
			ReactionModule.addReaction(message.channel_id, message.id, message.reactions[index].emoji);
	}

	addReactionToLRM(index, limit=10){
		const message = this.getLastReactableMessage(limit);
		if(message)this.addReaction(message, index);
	}

	addCommands(){
		this.commands.addCommand(new Command("+", args=>{
			const parsedInt = parseInt(args);
			this.addReactionToLRM(Math.min(!!parsedInt?parsedInt:0, 19));
		}));

		this.commands.addCommand(new Command("++", args=>{
			const parsedInt = parseInt(args);
			this.addReactionToLRM(Math.min(!!parsedInt?parsedInt:0, 19), 1);
		}))
	}

	stop(){BdApi.Patcher.unpatchAll("AddReaction");}
}

module.exports = AddReaction;
