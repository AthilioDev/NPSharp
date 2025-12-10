/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import themePickerContent from './media/theme_picker.js';
import themePickerSmallContent from './media/theme_picker_small.js';
import notebookProfileContent from './media/notebookProfile.js';
import { localize } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { NotebookSetting } from '../../notebook/common/notebookCommon.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../platform/accessibility/common/accessibility.js';
import { URI } from '../../../../base/common/uri.js';
import product from '../../../../platform/product/common/product.js';

interface IGettingStartedContentProvider {
	(): string;
}

const defaultChat = {
	documentationUrl: product.defaultChatAgent?.documentationUrl ?? '',
	manageSettingsUrl: product.defaultChatAgent?.manageSettingsUrl ?? '',
	provider: product.defaultChatAgent?.provider ?? { default: { name: '' } },
	publicCodeMatchesUrl: product.defaultChatAgent?.publicCodeMatchesUrl ?? '',
	termsStatementUrl: product.defaultChatAgent?.termsStatementUrl ?? '',
	privacyStatementUrl: product.defaultChatAgent?.privacyStatementUrl ?? ''
};

export const copilotSettingsMessage = localize({ key: 'settings', comment: ['{Locked="["}', '{Locked="]({0})"}', '{Locked="]({1})"}'] }, "{0} Copilot may show [public code]({1}) suggestions and use your data to improve the product. You can change these [settings]({2}) anytime.", defaultChat.provider.default.name, defaultChat.publicCodeMatchesUrl, defaultChat.manageSettingsUrl);

class GettingStartedContentProviderRegistry {

	private readonly providers = new Map<string, IGettingStartedContentProvider>();

	registerProvider(moduleId: string, provider: IGettingStartedContentProvider): void {
		this.providers.set(moduleId, provider);
	}

	getProvider(moduleId: string): IGettingStartedContentProvider | undefined {
		return this.providers.get(moduleId);
	}
}
export const gettingStartedContentRegistry = new GettingStartedContentProviderRegistry();

export async function moduleToContent(resource: URI): Promise<string> {
	if (!resource.query) {
		throw new Error('Getting Started: invalid resource');
	}

	const query = JSON.parse(resource.query);
	if (!query.moduleId) {
		throw new Error('Getting Started: invalid resource');
	}

	const provider = gettingStartedContentRegistry.getProvider(query.moduleId);
	if (!provider) {
		throw new Error(`Getting Started: no provider registered for ${query.moduleId}`);
	}

	return provider();
}

gettingStartedContentRegistry.registerProvider('vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker', themePickerContent);
gettingStartedContentRegistry.registerProvider('vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker_small', themePickerSmallContent);
gettingStartedContentRegistry.registerProvider('vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile', notebookProfileContent);
// Register empty media for accessibility walkthrough
gettingStartedContentRegistry.registerProvider('vs/workbench/contrib/welcomeGettingStarted/common/media/empty', () => '');

const setupIcon = registerIcon('getting-started-setup', Codicon.zap, localize('getting-started-setup-icon', "Icon used for the setup category of welcome page"));
const beginnerIcon = registerIcon('getting-started-beginner', Codicon.lightbulb, localize('getting-started-beginner-icon', "Icon used for the beginner category of welcome page"));

export type BuiltinGettingStartedStep = {
	id: string;
	title: string;
	description: string;
	completionEvents?: string[];
	when?: string;
	media:
	| { type: 'image'; path: string | { hc: string; hcLight?: string; light: string; dark: string }; altText: string }
	| { type: 'svg'; path: string; altText: string }
	| { type: 'markdown'; path: string }
	| { type: 'video'; path: string | { hc: string; hcLight?: string; light: string; dark: string }; poster?: string | { hc: string; hcLight?: string; light: string; dark: string }; altText: string };
};

export type BuiltinGettingStartedCategory = {
	id: string;
	title: string;
	description: string;
	isFeatured: boolean;
	next?: string;
	icon: ThemeIcon;
	when?: string;
	content:
	| { type: 'steps'; steps: BuiltinGettingStartedStep[] };
	walkthroughPageTitle: string;
};

export type BuiltinGettingStartedStartEntry = {
	id: string;
	title: string;
	description: string;
	icon: ThemeIcon;
	when?: string;
	content:
	| { type: 'startEntry'; command: string };
};

type GettingStartedWalkthroughContent = BuiltinGettingStartedCategory[];
type GettingStartedStartEntryContent = BuiltinGettingStartedStartEntry[];

export const startEntries: GettingStartedStartEntryContent = [
	{
		id: 'welcome.showNewFileEntries',
		title: localize('gettingStarted.newFile.title', "Novo Arquivo..."),
		description: localize('gettingStarted.newFile.description', "Abrir um novo arquivo de texto sem título, notebook ou editor paralelo — disciplina de programador que segue adiante sem tremer."),
		icon: Codicon.newFile,
		content: {
			type: 'startEntry',
			command: 'command:welcome.showNewFileEntries',
		}
	},
	{
		id: 'topLevelOpenMac',
		title: localize('gettingStarted.openMac.title', "Abrir..."),
		description: localize('gettingStarted.openMac.description', "Abra arquivo ou pasta e comece a Trabalhar"),
		icon: Codicon.folderOpened,
		when: '!isWeb && isMac',
		content: {
			type: 'startEntry',
			command: 'command:workbench.action.files.openFileFolder',
		}
	},
	{
		id: 'topLevelOpenFile',
		title: localize('gettingStarted.openFile.title', "Abrir Arquivo..."),
		description: localize('gettingStarted.openFile.description', "Inicie arquivo, sinta presença"),
		icon: Codicon.goToFile,
		when: 'isWeb || !isMac',
		content: {
			type: 'startEntry',
			command: 'command:workbench.action.files.openFile',
		}
	},
	{
		id: 'topLevelOpenFolder',
		title: localize('gettingStarted.openFolder.title', "Abrir Pasta..."),
		description: localize('gettingStarted.openFolder.description', "Abra pasta, siga impulso"),
		icon: Codicon.folderOpened,
		when: '!isWeb && !isMac',
		content: {
			type: 'startEntry',
			command: 'command:workbench.action.files.openFolder',
		}
	},
	{
		id: 'topLevelOpenFolderWeb',
		title: localize('gettingStarted.openFolder.title', "Abrir Pasta..."),
		description: localize('gettingStarted.openFolder.description', "Abra pasta, siga impulso"),
		icon: Codicon.folderOpened,
		when: '!openFolderWorkspaceSupport && workbenchState == \'workspace\'',
		content: {
			type: 'startEntry',
			command: 'command:workbench.action.files.openFolderViaWorkspace',
		}
	},
	{
		id: 'topLevelGitClone',
		title: localize('gettingStarted.topLevelGitClone.title', "Clone Repositório Git..."),
		description: localize('gettingStarted.topLevelGitClone.description', "Clone um Repositório para uma Pasta Local, siga o fio"),
		when: 'config.git.enabled && !git.missing',
		icon: Codicon.sourceControl,
		content: {
			type: 'startEntry',
			command: 'command:git.clone',
		}
	},
	{
		id: 'topLevelGitOpen',
		title: localize('gettingStarted.topLevelGitOpen.title', "Abrir um Repositório..."),
		description: localize('gettingStarted.topLevelGitOpen.description', "Conecte remotamente, explore, busque, edite, commit — siga o fio"),
		when: 'workspacePlatform == \'webworker\'',
		icon: Codicon.sourceControl,
		content: {
			type: 'startEntry',
			command: 'command:remoteHub.openRepository',
		}
	},
	{
		id: 'topLevelRemoteOpen',
		title: localize('gettingStarted.topLevelRemoteOpen.title', "Conectar em..."),
		description: localize('gettingStarted.topLevelRemoteOpen.description', "Conecte-se a workspaces remotos, sinta a corrente"),
		when: '!isWeb',
		icon: Codicon.remote,
		content: {
			type: 'startEntry',
			command: 'command:workbench.action.remote.showMenu',
		}
	},
	{
		id: 'topLevelOpenTunnel',
		title: localize('gettingStarted.topLevelOpenTunnel.title', "Open Tunnel..."),
		description: localize('gettingStarted.topLevelOpenTunnel.description', "Conecte-se à máquina remota pelo túnel, sinta o caminho"),
		when: 'isWeb && showRemoteStartEntryInWeb',
		icon: Codicon.remote,
		content: {
			type: 'startEntry',
			command: 'command:workbench.action.remote.showWebStartEntryActions',
		}
	},
	// {
	// 	id: 'topLevelNewWorkspaceChat',
	// 	title: localize('gettingStarted.newWorkspaceChat.title', "Generate New Workspace..."),
	// 	description: localize('gettingStarted.newWorkspaceChat.description', "Chat to create a new workspace"),
	// 	icon: Codicon.chatSparkle,
	// 	when: '!isWeb && !chatSetupHidden',
	// 	content: {
	// 		type: 'startEntry',
	// 		command: 'command:welcome.newWorkspaceChat',
	// 	}
	// },
];

const Button = (title: string, href: string) => `[${title}](${href})`;

// cScyStatementUrl);
//const CopilotAnonymousButton = Button(localize('setupCopilotButton.setup', "Use AI Features"), `command:workbench.action.chat.triggerSetupAnonymousWithoutDialog`);
//const CopilotSignedOutButton = Button(localize('setupCopilotButton.setup', "Use AI Features"), `command:workbench.action.chat.triggerSetup`);
//const CopilotSignedInButton = Button(localize('setupCopilotButton.setup', "Use AI Features"), `command:workbench.action.chat.triggerSetup`);
//const CopilotCompleteButton = Button(localize('setupCopilotButton.chatWithCopilot', "Start to Chat"), 'command:workbench.action.chat.open');

// function createCopilotSetupStep(id: string, button: string, when: string, includeTerms: boolean): BuiltinGettingStartedStep {
// 	const description = includeTerms ?
// 		`${CopilotDescription}\n${CopilotTermsString}\n${button}` :
// 		`${CopilotDescription}\n${button}`;

// 	return {
// 		id,
// 		title: CopilotStepTitle,
// 		description,
// 		when: `${when} && !chatSetupHidden`,
// 		media: {
// 			type: 'svg', altText: 'VS Code Copilot multi file edits', path: 'multi-file-edits.svg'
// 		},
// 	};
// }

export const walkthroughs: GettingStartedWalkthroughContent = [
	{
		id: 'Setup',
		title: localize('gettingStarted.setup.title', "Comece com NP Sharp"),
		description: localize('gettingStarted.setup.description', "Editor aberto, fundamentos aprendidos, comece a escrever"),
		isFeatured: true,
		icon: setupIcon,
		when: '!isWeb',
		walkthroughPageTitle: localize('gettingStarted.setup.walkthroughPageTitle', 'Setup NP Sharp'),
		next: 'Beginner',
		content: {
			type: 'steps',
			steps: [
				//createCopilotSetupStep('CopilotSetupAnonymous', CopilotAnonymousButton, 'chatAnonymous && !chatSetupInstalled', true),
				//createCopilotSetupStep('CopilotSetupSignedOut', CopilotSignedOutButton, 'chatEntitlementSignedOut && !chatAnonymous', false),
				//createCopilotSetupStep('CopilotSetupComplete', CopilotCompleteButton, 'chatSetupInstalled && !chatSetupDisabled && (chatAnonymous || chatPlanPro || chatPlanProPlus || chatPlanBusiness || chatPlanEnterprise || chatPlanFree)', false),
				//createCopilotSetupStep('CopilotSetupSignedIn', CopilotSignedInButton, '!chatEntitlementSignedOut && (!chatSetupInstalled || chatSetupDisabled || chatPlanCanSignUp)', false),
				{
					id: 'pickColorTheme',
					title: localize('gettingStarted.pickColor.title', "Selecione tema, deixe sombra guiar"),
					description: localize('gettingStarted.pickColor.description.interpolated', "O tema certo ajuda a focar no código, descansa os olhos, e é mais divertido de usar\n{0}", Button(localize('titleID', "Mergulhe nas cores que respiram junto ao código"), 'command:workbench.action.selectTheme')),
					completionEvents: [
						'onSettingChanged:workbench.colorTheme',
						'onCommand:workbench.action.selectTheme'
					],
					media: { type: 'markdown', path: 'theme_picker', }
				}
				// {
				// 	id: 'videoTutorial',
				// 	title: localize('gettingStarted.videoTutorial.title', "Watch video tutorials"),
				// 	description: localize('gettingStarted.videoTutorial.description.interpolated', "Watch the first in a series of short & practical video tutorials for VS Code's key features.\n{0}", Button(localize('watch', "Watch Tutorial"), 'https://aka.ms/vscode-getting-started-video')),
				// 	media: { type: 'svg', altText: 'VS Code Settings', path: 'learn.svg' },
				// }
			]
		}
	},

	{
		id: 'SetupWeb',
		title: localize('gettingStarted.setupWeb.title', "Get Started with VS Code for the Web"),
		description: localize('gettingStarted.setupWeb.description', "Customize your editor, learn the basics, and start coding"),
		isFeatured: true,
		icon: setupIcon,
		when: 'isWeb',
		next: 'Beginner',
		walkthroughPageTitle: localize('gettingStarted.setupWeb.walkthroughPageTitle', 'Setup VS Code Web'),
		content: {
			type: 'steps',
			steps: [
				{
					id: 'pickColorThemeWeb',
					title: localize('gettingStarted.pickColor.title', "Choose your theme"),
					description: localize('gettingStarted.pickColor.description.interpolated', "The right theme helps you focus on your code, is easy on your eyes, and is simply more fun to use.\n{0}", Button(localize('titleID', "Browse Color Themes"), 'command:workbench.action.selectTheme')),
					completionEvents: [
						'onSettingChanged:workbench.colorTheme',
						'onCommand:workbench.action.selectTheme'
					],
					media: { type: 'markdown', path: 'theme_picker', }
				},
				{
					id: 'menuBarWeb',
					title: localize('gettingStarted.menuBar.title', "Just the right amount of UI"),
					description: localize('gettingStarted.menuBar.description.interpolated', "The full menu bar is available in the dropdown menu to make room for your code. Toggle its appearance for faster access. \n{0}", Button(localize('toggleMenuBar', "Toggle Menu Bar"), 'command:workbench.action.toggleMenuBar')),
					when: 'isWeb',
					media: {
						type: 'svg', altText: 'Comparing menu dropdown with the visible menu bar.', path: 'menuBar.svg'
					},
				},
				{
					id: 'extensionsWebWeb',
					title: localize('gettingStarted.extensions.title', "Code with extensions"),
					description: localize('gettingStarted.extensionsWeb.description.interpolated', "Extensions are VS Code's power-ups. A growing number are becoming available in the web.\n{0}", Button(localize('browsePopularWeb', "Browse Popular Web Extensions"), 'command:workbench.extensions.action.showPopularExtensions')),
					when: 'workspacePlatform == \'webworker\'',
					media: {
						type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions-web.svg'
					},
				},
				{
					id: 'findLanguageExtensionsWeb',
					title: localize('gettingStarted.findLanguageExts.title', "Rich support for all your languages"),
					description: localize('gettingStarted.findLanguageExts.description.interpolated', "Code smarter with syntax highlighting, inline suggestions, linting and debugging. While many languages are built-in, many more can be added as extensions.\n{0}", Button(localize('browseLangExts', "Browse Language Extensions"), 'command:workbench.extensions.action.showLanguageExtensions')),
					when: 'workspacePlatform != \'webworker\'',
					media: {
						type: 'svg', altText: 'Language extensions', path: 'languages.svg'
					},
				},
				{
					id: 'settingsSyncWeb',
					title: localize('gettingStarted.settingsSync.title', "Sync settings across devices"),
					description: localize('gettingStarted.settingsSync.description.interpolated', "Keep your essential customizations backed up and updated across all your devices.\n{0}", Button(localize('enableSync', "Backup and Sync Settings"), 'command:workbench.userDataSync.actions.turnOn')),
					when: 'syncStatus != uninitialized',
					completionEvents: ['onEvent:sync-enabled'],
					media: {
						type: 'svg', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: 'settingsSync.svg'
					},
				},
				{
					id: 'commandPaletteTaskWeb',
					title: localize('gettingStarted.commandPalette.title', "Unlock productivity with the Command Palette "),
					description: localize('gettingStarted.commandPalette.description.interpolated', "Run commands without reaching for your mouse to accomplish any task in VS Code.\n{0}", Button(localize('commandPalette', "Open Command Palette"), 'command:workbench.action.showCommands')),
					media: { type: 'svg', altText: 'Command Palette overlay for searching and executing commands.', path: 'commandPalette.svg' },
				},
				{
					id: 'pickAFolderTask-WebWeb',
					title: localize('gettingStarted.setup.OpenFolder.title', "Open up your code"),
					description: localize('gettingStarted.setup.OpenFolderWeb.description.interpolated', "You're all set to start coding. You can open a local project or a remote repository to get your files into VS Code.\n{0}\n{1}", Button(localize('openFolder', "Open Folder"), 'command:workbench.action.addRootFolder'), Button(localize('openRepository', "Open Repository"), 'command:remoteHub.openRepository')),
					when: 'workspaceFolderCount == 0',
					media: {
						type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
					}
				},
				{
					id: 'quickOpenWeb',
					title: localize('gettingStarted.quickOpen.title', "Quickly navigate between your files"),
					description: localize('gettingStarted.quickOpen.description.interpolated', "Navigate between files in an instant with one keystroke. Tip: Open multiple files by pressing the right arrow key.\n{0}", Button(localize('quickOpen', "Quick Open a File"), 'command:toSide:workbench.action.quickOpen')),
					when: 'workspaceFolderCount != 0',
					media: {
						type: 'svg', altText: 'Go to file in quick search.', path: 'search.svg'
					}
				}
			]
		}
	},
	{
		id: 'SetupAccessibility',
		title: localize('gettingStarted.setupAccessibility.title', "Comece a usar recursos de acessibilidade"),
		description: localize('gettingStarted.setupAccessibility.description', "Aprenda ferramentas e atalhos que tornam o VS Code acessível — algumas ações só fora do walkthrough"),
		isFeatured: true,
		icon: setupIcon,
		when: CONTEXT_ACCESSIBILITY_MODE_ENABLED.key,
		next: 'Setup',
		walkthroughPageTitle: localize('gettingStarted.setupAccessibility.walkthroughPageTitle', 'Setup NP Sharp Accessibility'),
		content: {
			type: 'steps',
			steps: [
				{
					id: 'accessibilityHelp',
					title: localize('gettingStarted.accessibilityHelp.title', "Abra a ajuda de acessibilidade e descubra recursos"),
					description: localize('gettingStarted.accessibilityHelp.description.interpolated', "O diálogo de ajuda de acessibilidade mostra o que esperar de cada recurso e os comandos ou atalhos para usá-los. Com foco em editor, terminal, notebook, chat, comentário ou console de depuração, abra o diálogo com “Abrir Ajuda de Acessibilidade”\n{0}", Button(localize('openAccessibilityHelp', "Open Accessibility Help"), 'command:editor.action.accessibilityHelp')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'accessibleView',
					title: localize('gettingStarted.accessibleView.title', "Usuários de leitor de tela podem inspecionar conteúdo linha por linha, caractere por caractere na visão acessível"),
					description: localize('gettingStarted.accessibleView.description.interpolated', "A visão acessível está disponível para terminal, hovers, notificações, comentários, saída de notebook, respostas de chat, autocompletes inline e console de depuração. Com foco em qualquer um desses elementos, abra com “Abrir Visão Acessível”\n{0}", Button(localize('openAccessibleView', "Abra a Visão Acessível"), 'command:editor.action.accessibleView')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'verbositySettings',
					title: localize('gettingStarted.verbositySettings.title', "Controle a verbosidade dos labels ARIA"),
					description: localize('gettingStarted.verbositySettings.description.interpolated', "- Configurações de verbosidade do leitor de tela existem para recursos do workbench, permitindo que, após se familiarizar com uma função, o usuário evite ouvir dicas de operação.\nPor exemplo, recursos com diálogo de ajuda de acessibilidade indicarão como abrir o diálogo até que a configuração de verbosidade seja desativada.\n Outras configurações de acessibilidade podem ser ajustadas executando o comando “Abrir Configurações de Acessibilidade”{0}", Button(localize('openVerbositySettings', "Open Accessibility Settings"), 'command:workbench.action.openAccessibilitySettings')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'commandPaletteTaskAccessibility',
					title: localize('gettingStarted.commandPaletteAccessibility.title', "Desbloqueie produtividade com a Command Palette"),
					description: localize('gettingStarted.commandPaletteAccessibility.description.interpolated', "Execute comandos sem tocar no mouse e realize qualquer tarefa no NP Sharp\n{0}", Button(localize('commandPalette', "Abrir Command Palette"), 'command:workbench.action.showCommands')),
					media: { type: 'markdown', path: 'empty' },
				},
				{
					id: 'keybindingsAccessibility',
					title: localize('gettingStarted.keyboardShortcuts.title', "Personalize seus atalhos de teclado"),
					description: localize('gettingStarted.keyboardShortcuts.description.interpolated', "Descubra seus comandos favoritos e transforme-os em atalhos\n{0}", Button(localize('keyboardShortcuts', "Atalhos de Teclado"), 'command:toSide:workbench.action.openGlobalKeybindings')),
					media: {
						type: 'markdown', path: 'empty',
					}
				},
				{
					id: 'accessibilitySignals',
					title: localize('gettingStarted.accessibilitySignals.title', "Ajuste quais sinais de acessibilidade deseja receber por áudio ou dispositivo braille"),
					description: localize('gettingStarted.accessibilitySignals.description.interpolated', "Sons e anúncios de acessibilidade são reproduzidos no workbench para diferentes eventos.\nEles podem ser descobertos e configurados usando os comandos “List Signal Sounds” e “List Signal Announcements”\n{0}\n{1}", Button(localize('listSignalSounds', "List Signal Sounds"), 'command:signals.sounds.help'), Button(localize('listSignalAnnouncements', "List Signal Announcements"), 'command:accessibility.announcement.help')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'hover',
					title: localize('gettingStarted.hover.title', "Acesse o hover no editor para obter mais informações sobre uma variável ou símbolo"),
					description: localize('gettingStarted.hover.description.interpolated', "Enquanto o foco estiver no editor sobre uma variável ou símbolo, um hover pode ser acessado com os comandos “Show” ou “Open Hover” \n{0}", Button(localize('showOrFocusHover', "Show or Focus Hover"), 'command:editor.action.showHover')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'goToSymbol',
					title: localize('gettingStarted.goToSymbol.title', "Navegue pelos símbolos de um arquivo — cada movimento carrega algo silencioso que só quem sente percebe"),
					description: localize('gettingStarted.goToSymbol.description.interpolated', "O comando “Go to Symbol” é útil para navegar entre pontos importantes de um documento\n{0}", Button(localize('openGoToSymbol', "Go to Symbol"), 'command:editor.action.goToSymbol')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'codeFolding',
					title: localize('gettingStarted.codeFolding.title', "Use o code folding para recolher blocos de código e focar no que importa"),
					description: localize('gettingStarted.codeFolding.description.interpolated', "- Dobre ou desdobre uma seção de código com o comando “Toggle Fold”.\n{0}\n- Dobre ou desdobre recursivamente com o comando “Toggle Fold Recursively”\n{1}\n", Button(localize('toggleFold', "Toggle Fold"), 'command:editor.toggleFold'), Button(localize('toggleFoldRecursively', "Toggle Fold Recursively"), 'command:editor.toggleFoldRecursively')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'intellisense',
					title: localize('gettingStarted.intellisense.title', "Use o Intellisense para melhorar a eficiência da codificação"),
					description: localize('gettingStarted.intellisense.description.interpolated', "As sugestões do Intellisense podem ser abertas com o comando “Trigger Intellisense”.\n{0}\n- As sugestões inline do Intellisense podem ser acionadas com “Trigger Inline Suggestion”.\n{1}\n- Configurações úteis incluem editor inlineCompletionsAccessibilityVerbose and editor.screenReaderAnnounceInlineSuggestion.", Button(localize('triggerIntellisense', "Trigger Intellisense"), 'command:editor.action.triggerSuggest'), Button(localize('triggerInlineSuggestion', 'Trigger Inline Suggestion'), 'command:editor.action.inlineSuggest.trigger')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'accessibilitySettings',
					title: localize('gettingStarted.accessibilitySettings.title', "Configure as configurações de acessibilidade"),
					description: localize('gettingStarted.accessibilitySettings.description.interpolated', "As configurações de acessibilidade podem ser ajustadas executando o comando “Open Accessibility Settings”\n{0}", Button(localize('openAccessibilitySettings', "Open Accessibility Settings"), 'command:workbench.action.openAccessibilitySettings')),
					media: { type: 'markdown', path: 'empty' }
				},
				{
					id: 'dictation',
					title: localize('gettingStarted.dictation.title', "Use ditado para escrever código e texto no editor e terminal"),
					description: localize('gettingStarted.dictation.description.interpolated', "O ditado permite escrever código e texto usando sua voz. Pode ser ativado com o comando “Voice: Start Dictation in Editor”.\n{0}\n- Para ditado no terminal, use os comandos “Voice: Start Dictation in Terminal” e “Voice: Stop Dictation in Terminal” \n{1}\n{2}", Button(localize('toggleDictation', "Voice: Start Dictation in Editor"), 'command:workbench.action.editorDictation.start'), Button(localize('terminalStartDictation', "Terminal: Start Dictation in Terminal"), 'command:workbench.action.terminal.startVoice'), Button(localize('terminalStopDictation', "Terminal: Stop Dictation in Terminal"), 'command:workbench.action.terminal.stopVoice')),
					when: 'hasSpeechProvider',
					media: { type: 'markdown', path: 'empty' }
				}
			]
		}
	},
	{
		id: 'Beginner',
		isFeatured: false,
		title: localize('gettingStarted.beginner.title', "Aprenda os fundamentos"),
		icon: beginnerIcon,
		description: localize('gettingStarted.beginner.description', "Tenha uma visão geral dos recursos mais essenciais"),
		walkthroughPageTitle: localize('gettingStarted.beginner.walkthroughPageTitle', 'Essential Features'),
		content: {
			type: 'steps',
			steps: [
				{
					id: 'settingsAndSync',
					title: localize('gettingStarted.settings.title', "Ajuste suas configurações"),
					description: localize('gettingStarted.settingsAndSync.description.interpolated', "Personalize todos os aspectos do NP Sharp e [sincronize](command:workbench.userDataSync.actions.turnOn) as customizações entre dispositivos \n{0}", Button(localize('tweakSettings', "Open Settings"), 'command:toSide:workbench.action.openSettings')),
					when: 'workspacePlatform != \'webworker\' && syncStatus != uninitialized',
					completionEvents: ['onEvent:sync-enabled'],
					media: {
						type: 'svg', altText: 'VS Code Settings', path: 'settings.svg'
					},
				},
				{
					id: 'extensions',
					title: localize('gettingStarted.extensions.title', "Programe com extensões "),
					description: localize('gettingStarted.extensions.description.interpolated', "Extensões são os power-ups do NP Sharp. Podem ir de pequenos atalhos de produtividade a expansão de funcionalidades nativas, ou até adicionar capacidades totalmente novas \n{0}", Button(localize('browsePopular', "Browse Popular Extensions"), 'command:workbench.extensions.action.showPopularExtensions')),
					when: 'workspacePlatform != \'webworker\'',
					media: {
						type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions.svg'
					},
				},
				{
					id: 'terminal',
					title: localize('gettingStarted.terminal.title', "Terminal integrado "),
					description: localize('gettingStarted.terminal.description.interpolated', "Execute comandos shell rapidamente e monitore a saída da build, bem ao lado do seu código\n{0}", Button(localize('showTerminal', "Open Terminal"), 'command:workbench.action.terminal.toggleTerminal')),
					when: 'workspacePlatform != \'webworker\' && remoteName != codespaces && !terminalIsOpen',
					media: {
						type: 'svg', altText: 'Integrated terminal running a few npm commands', path: 'terminal.svg'
					},
				},
				{
					id: 'debugging',
					title: localize('gettingStarted.debug.title', "Veja seu código em ação"),
					description: localize('gettingStarted.debug.description.interpolated', "Acelere seu ciclo de edição, build, teste e depuração configurando uma launch configuration\n{0}", Button(localize('runProject', "Run your Project"), 'command:workbench.action.debug.selectandstart')),
					when: 'workspacePlatform != \'webworker\' && workspaceFolderCount != 0',
					media: {
						type: 'svg', altText: 'Run and debug view.', path: 'debug.svg',
					},
				},
				{
					id: 'scmClone',
					title: localize('gettingStarted.scm.title', "Acompanhe seu código com Git"),
					description: localize('gettingStarted.scmClone.description.interpolated', "Configure o controle de versão integrado para seu projeto, acompanhando alterações e colaborando com outros \n{0}", Button(localize('cloneRepo', "Clone Repository"), 'command:git.clone')),
					when: 'config.git.enabled && !git.missing && workspaceFolderCount == 0',
					media: {
						type: 'svg', altText: 'Source Control view.', path: 'git.svg',
					},
				},
				{
					id: 'scmSetup',
					title: localize('gettingStarted.scm.title', "Acompanhe seu código com Git"),
					description: localize('gettingStarted.scmSetup.description.interpolated', "Configure o controle de versão integrado para seu projeto, acompanhando alterações e colaborando com outros — e sinta algo silencioso guiando cada mudança.\n{0}", Button(localize('initRepo', "Initialize Git Repository"), 'command:git.init')),
					when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount == 0',
					media: {
						type: 'svg', altText: 'Source Control view.', path: 'git.svg',
					},
				},
				{
					id: 'scm',
					title: localize('gettingStarted.scm.title', "Acompanhe seu código com Git."),
					description: localize('gettingStarted.scm.description.interpolated', "Chega de procurar comandos Git! Workflows do Git e GitHub estão integrados de forma fluida \n{0}", Button(localize('openSCM', "Open Source Control"), 'command:workbench.view.scm')),
					when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount != 0 && activeViewlet != \'workbench.view.scm\'',
					media: {
						type: 'svg', altText: 'Source Control view.', path: 'git.svg',
					},
				},
				{
					id: 'installGit',
					title: localize('gettingStarted.installGit.title', "Instale o Git"),
					description: localize({ key: 'gettingStarted.installGit.description.interpolated', comment: ['The placeholders are command link items should not be translated'] }, "Instale o Git para acompanhar alterações em seus projetos.\n{0}\n- {1}Recarregue a janela{2} após a instalação para completar a configuração do Git", Button(localize('installGit', "Install Git"), 'https://aka.ms/vscode-install-git'), '[', '](command:workbench.action.reloadWindow)'),
					when: 'git.missing',
					media: {
						type: 'svg', altText: 'Install Git.', path: 'git.svg',
					},
					completionEvents: [
						'onContext:git.state == initialized'
					]
				},

				{
					id: 'tasks',
					title: localize('gettingStarted.tasks.title', "Automatize as tarefas do seu projeto"),
					when: 'workspaceFolderCount != 0 && workspacePlatform != \'webworker\'',
					description: localize('gettingStarted.tasks.description.interpolated', "Crie tarefas para seus fluxos de trabalho comuns e aproveite a experiência integrada de executar scripts e verificar resultados automaticamente\n{0}", Button(localize('runTasks', "Run Auto-detected Tasks"), 'command:workbench.action.tasks.runTask')),
					media: {
						type: 'svg', altText: 'Task runner.', path: 'runTask.svg',
					},
				},
				{
					id: 'shortcuts',
					title: localize('gettingStarted.shortcuts.title', "Personalize seus atalhos"),
					description: localize('gettingStarted.shortcuts.description.interpolated', "Depois de descobrir seus comandos favoritos, crie atalhos personalizados para acessá-los instantaneamente\n{0}", Button(localize('keyboardShortcuts', "Keyboard Shortcuts"), 'command:toSide:workbench.action.openGlobalKeybindings')),
					media: {
						type: 'svg', altText: 'Interactive shortcuts.', path: 'shortcuts.svg',
					}
				},
				{
					id: 'workspaceTrust',
					title: localize('gettingStarted.workspaceTrust.title', "Navegue e edite código com segurança"),
					description: localize('gettingStarted.workspaceTrust.description.interpolated', "{0} Permite que você decida se suas pastas de projeto devem **permitir ou restringir** a execução automática de código __(necessário para extensões, depuração, etc)__.\n- Abrir um arquivo/pasta solicitará que você conceda confiança. Você sempre pode {1} mais tarde ", Button(localize('workspaceTrust', "Workspace Trust"), 'https://code.visualstudio.com/docs/editor/workspace-trust'), Button(localize('enableTrust', "enable trust"), 'command:toSide:workbench.trust.manage')),
					when: 'workspacePlatform != \'webworker\' && !isWorkspaceTrusted && workspaceFolderCount == 0',
					media: {
						type: 'svg', altText: 'Workspace Trust editor in Restricted mode and a primary button for switching to Trusted mode.', path: 'workspaceTrust.svg'
					},
				},
			]
		}
	},
	{
		id: 'notebooks',
		title: localize('gettingStarted.notebook.title', "Personalize seus Notebooks"),
		description: '',
		icon: setupIcon,
		isFeatured: false,
		when: `config.${NotebookSetting.openGettingStarted} && userHasOpenedNotebook`,
		walkthroughPageTitle: localize('gettingStarted.notebook.walkthroughPageTitle', 'Notebooks'),
		content: {
			type: 'steps',
			steps: [
				{
					completionEvents: ['onCommand:notebook.setProfile'],
					id: 'notebookProfile',
					title: localize('gettingStarted.notebookProfile.title', "Escolha o layout para seus Notebooks"),
					description: localize('gettingStarted.notebookProfile.description', "Faça seus Notebooks ficarem exatamente do jeito que você prefere"),
					when: 'userHasOpenedNotebook',
					media: {
						type: 'markdown', path: 'notebookProfile'
					}
				},
			]
		}
	}
];

