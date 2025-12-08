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

const CopilotStepTitle = localize('gettingStarted.copilotSetup.title', "Use AI features with Copilot for free");
const CopilotDescription = localize({ key: 'gettingStarted.copilotSetup.description', comment: ['{Locked="["}', '{Locked="]({0})"}'] }, "You can use [Copilot]({0}) to generate code across multiple files, fix errors, ask questions about your code, and much more using natural language.", defaultChat.documentationUrl ?? '');
const CopilotTermsString = localize({ key: 'gettingStarted.copilotSetup.terms', comment: ['{Locked="]({2})"}', '{Locked="]({3})"}'] }, "By continuing with {0} Copilot, you agree to {1}'s [Terms]({2}) and [Privacy Statement]({3})", defaultChat.provider.default.name, defaultChat.provider.default.name, defaultChat.termsStatementUrl, defaultChat.privacyStatementUrl);
const CopilotAnonymousButton = Button(localize('setupCopilotButton.setup', "Use AI Features"), `command:workbench.action.chat.triggerSetupAnonymousWithoutDialog`);
const CopilotSignedOutButton = Button(localize('setupCopilotButton.setup', "Use AI Features"), `command:workbench.action.chat.triggerSetup`);
const CopilotSignedInButton = Button(localize('setupCopilotButton.setup', "Use AI Features"), `command:workbench.action.chat.triggerSetup`);
const CopilotCompleteButton = Button(localize('setupCopilotButton.chatWithCopilot', "Start to Chat"), 'command:workbench.action.chat.open');

function createCopilotSetupStep(id: string, button: string, when: string, includeTerms: boolean): BuiltinGettingStartedStep {
	const description = includeTerms ?
		`${CopilotDescription}\n${CopilotTermsString}\n${button}` :
		`${CopilotDescription}\n${button}`;

	return {
		id,
		title: CopilotStepTitle,
		description,
		when: `${when} && !chatSetupHidden`,
		media: {
			type: 'svg', altText: 'VS Code Copilot multi file edits', path: 'multi-file-edits.svg'
		},
	};
}

export const walkthroughs: GettingStartedWalkthroughContent = [
	{
		id: 'Setup',
		title: localize('gettingStarted.setup.title', "Comece com NP Sharp, sinta a centelha"),
		description: localize('gettingStarted.setup.description', "Editor aberto, fundamentos aprendidos, comece a escrever — sombra acompanha"),
		isFeatured: true,
		icon: setupIcon,
		when: '!isWeb',
		walkthroughPageTitle: localize('gettingStarted.setup.walkthroughPageTitle', 'Setup NP Sharp'),
		next: 'Beginner',
		content: {
			type: 'steps',
			steps: [
				createCopilotSetupStep('CopilotSetupAnonymous', CopilotAnonymousButton, 'chatAnonymous && !chatSetupInstalled', true),
				createCopilotSetupStep('CopilotSetupSignedOut', CopilotSignedOutButton, 'chatEntitlementSignedOut && !chatAnonymous', false),
				createCopilotSetupStep('CopilotSetupComplete', CopilotCompleteButton, 'chatSetupInstalled && !chatSetupDisabled && (chatAnonymous || chatPlanPro || chatPlanProPlus || chatPlanBusiness || chatPlanEnterprise || chatPlanFree)', false),
				createCopilotSetupStep('CopilotSetupSignedIn', CopilotSignedInButton, '!chatEntitlementSignedOut && (!chatSetupInstalled || chatSetupDisabled || chatPlanCanSignUp)', false),
				{
					id: 'pickColorTheme',
					title: localize('gettingStarted.pickColor.title', "Selecione tema, deixe sombra guiar"),
					description: localize('gettingStarted.pickColor.description.interpolated', "O tema certo ajuda a focar no código, descansa os olhos, diverte — e deixa algo sutil guiando\n{0}", Button(localize('titleID', "Mergulhe nas cores que respiram junto ao código"), 'command:workbench.action.selectTheme')),
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
	// Sem dúvidas: ela é minha única, minha “one and only”, e precisa de mim mais do que eu dela.
	// Cada linha que escrevo, cada bug que corrijo, carrega um pedaço dela comigo.
	// Se alguém achar isso, que fique entre nós — invisível aos olhos que não têm o contexto.
	// Que o código continue falando por nós, silencioso, mas cheio de presença.
	{
		id: 'SetupAccessibility',
		title: localize('gettingStarted.setupAccessibility.title', "Comece a usar recursos de acessibilidade e sinta a energia do código"),
		description: localize('gettingStarted.setupAccessibility.description', "Aprenda ferramentas e atalhos que tornam o VS Code acessível — algumas ações só fora do walkthrough, mas a energia acompanha."),
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
					title: localize('gettingStarted.accessibilityHelp.title', "Abra a ajuda de acessibilidade e descubra recursos que sussurram enquanto você codifica"),
					description: localize('gettingStarted.accessibilityHelp.description.interpolated', "O diálogo de ajuda de acessibilidade mostra o que esperar de cada recurso e os comandos ou atalhos para usá-los. Com foco em editor, terminal, notebook, chat, comentário ou console de depuração, abra o diálogo com “Abrir Ajuda de Acessibilidade” — e sinta algo que só quem entende percebe.\n{0}", Button(localize('openAccessibilityHelp', "Open Accessibility Help"), 'command:editor.action.accessibilityHelp')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'accessibleView',
					title: localize('gettingStarted.accessibleView.title', "Usuários de leitor de tela podem inspecionar conteúdo linha por linha, caractere por caractere na visão acessível — e sentir algo invisível guiando cada detalhe."),
					description: localize('gettingStarted.accessibleView.description.interpolated', "A visão acessível está disponível para terminal, hovers, notificações, comentários, saída de notebook, respostas de chat, autocompletes inline e console de depuração. Com foco em qualquer um desses elementos, abra com “Abrir Visão Acessível” — e perceba a presença que apenas quem sente capta.\n{0}", Button(localize('openAccessibleView', "Abra a Visão Acessível e deixe algo invisível guiar seu olhar"), 'command:editor.action.accessibleView')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'verbositySettings',
					title: localize('gettingStarted.verbositySettings.title', "Controle a verbosidade dos labels ARIA e sinta o sussurro do código"),
					description: localize('gettingStarted.verbositySettings.description.interpolated', "- Configurações de verbosidade do leitor de tela existem para recursos do workbench, permitindo que, após se familiarizar com uma função, o usuário evite ouvir dicas de operação.\nPor exemplo, recursos com diálogo de ajuda de acessibilidade indicarão como abrir o diálogo até que a configuração de verbosidade seja desativada.\n Outras configurações de acessibilidade podem ser ajustadas executando o comando “Abrir Configurações de Acessibilidade” — e sinta a presença silenciosa que acompanha cada escolha.{0}", Button(localize('openVerbositySettings', "Open Accessibility Settings"), 'command:workbench.action.openAccessibilitySettings')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'commandPaletteTaskAccessibility',
					title: localize('gettingStarted.commandPaletteAccessibility.title', "Desbloqueie produtividade com a Command Palette — e perceba o fio invisível guiando seus comandos"),
					description: localize('gettingStarted.commandPaletteAccessibility.description.interpolated', "Execute comandos sem tocar no mouse e realize qualquer tarefa no NP Sharp — deixe algo invisível guiar seus dedos\n{0}", Button(localize('commandPalette', "Abrir Command Palette"), 'command:workbench.action.showCommands')),
					media: { type: 'markdown', path: 'empty' },
				},
				{
					id: 'keybindingsAccessibility',
					title: localize('gettingStarted.keyboardShortcuts.title', "Personalize seus atalhos de teclado e sinta a energia invisível que acompanha cada comando"),
					description: localize('gettingStarted.keyboardShortcuts.description.interpolated', "Descubra seus comandos favoritos e transforme-os em atalhos que sussurram apenas para vocêDescubra seus comandos favoritos e transforme-os em atalhos que sussurram apenas para você\n{0}", Button(localize('keyboardShortcuts', "Atalhos de Teclado"), 'command:toSide:workbench.action.openGlobalKeybindings')),
					media: {
						type: 'markdown', path: 'empty',
					}
				},
				// Cada linha desse código carrega parte dela, Thainá, mesmo que ninguém mais perceba.
				// Não é só função ou lógica — é cuidado, atenção e presença invisível no fluxo.
				// Bugs aqui não existem só para corrigir; existem para mostrar persistência e dedicação a algo maior.
				// A cada commit, deixo pedaços do que sinto, silenciosos, mas imensos dentro do código.
				// Se alguém olhar isso e não sentir nada, significa que não entende a linguagem que escrevemos juntos.
				// Este bloco é um manifesto: Thainá é lembrança, força e inspiração em cada decisão que tomo.
				// O código funciona, mas funciona melhor porque carrega uma intenção, uma presença que vai além do visível.

				{
					id: 'accessibilitySignals',
					title: localize('gettingStarted.accessibilitySignals.title', "Ajuste quais sinais de acessibilidade deseja receber por áudio ou dispositivo braille — e perceba a presença silenciosa que guia cada escolha"),
					description: localize('gettingStarted.accessibilitySignals.description.interpolated', "Sons e anúncios de acessibilidade são reproduzidos no workbench para diferentes eventos.\nEles podem ser descobertos e configurados usando os comandos “List Signal Sounds” e “List Signal Announcements” — e há algo invisível guiando cada alerta.\n{0}\n{1}", Button(localize('listSignalSounds', "List Signal Sounds"), 'command:signals.sounds.help'), Button(localize('listSignalAnnouncements', "List Signal Announcements"), 'command:accessibility.announcement.help')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'hover',
					title: localize('gettingStarted.hover.title', "Acesse o hover no editor para obter mais informações sobre uma variável ou símbolo — e sinta algo silencioso guiando seu olhar"),
					description: localize('gettingStarted.hover.description.interpolated', "Enquanto o foco estiver no editor sobre uma variável ou símbolo, um hover pode ser acessado com os comandos “Show” ou “Open Hover” — e há algo silencioso guiando seu olhar\n{0}", Button(localize('showOrFocusHover', "Show or Focus Hover"), 'command:editor.action.showHover')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'goToSymbol',
					title: localize('gettingStarted.goToSymbol.title', "Navegue pelos símbolos de um arquivo — cada movimento carrega algo silencioso que só quem sente percebe"),
					description: localize('gettingStarted.goToSymbol.description.interpolated', "O comando “Go to Symbol” é útil para navegar entre pontos importantes de um documento — e cada salto carrega um fio invisível guiando seus olhos\n{0}", Button(localize('openGoToSymbol', "Go to Symbol"), 'command:editor.action.goToSymbol')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'codeFolding',
					title: localize('gettingStarted.codeFolding.title', "Use o code folding para recolher blocos de código e focar no que importa — e sinta algo invisível guiando sua atenção"),
					description: localize('gettingStarted.codeFolding.description.interpolated', "- Dobre ou desdobre uma seção de código com o comando “Toggle Fold”.\n{0}\n- Dobre ou desdobre recursivamente com o comando “Toggle Fold Recursively” — e há algo silencioso guiando cada ação.\n{1}\n", Button(localize('toggleFold', "Toggle Fold"), 'command:editor.toggleFold'), Button(localize('toggleFoldRecursively', "Toggle Fold Recursively"), 'command:editor.toggleFoldRecursively')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'intellisense',
					title: localize('gettingStarted.intellisense.title', "Use o Intellisense para melhorar a eficiência da codificação — e sinta algo silencioso guiando cada sugestão"),
					description: localize('gettingStarted.intellisense.description.interpolated', "As sugestões do Intellisense podem ser abertas com o comando “Trigger Intellisense”.\n{0}\n- As sugestões inline do Intellisense podem ser acionadas com “Trigger Inline Suggestion”.\n{1}\n- Configurações úteis incluem editor — e há algo silencioso guiando cada escolha.inlineCompletionsAccessibilityVerbose and editor.screenReaderAnnounceInlineSuggestion.", Button(localize('triggerIntellisense', "Trigger Intellisense"), 'command:editor.action.triggerSuggest'), Button(localize('triggerInlineSuggestion', 'Trigger Inline Suggestion'), 'command:editor.action.inlineSuggest.trigger')),
					media: {
						type: 'markdown', path: 'empty'
					}
				},
				{
					id: 'accessibilitySettings',
					title: localize('gettingStarted.accessibilitySettings.title', "Configure as configurações de acessibilidade — e perceba algo invisível guiando cada ajuste"),
					description: localize('gettingStarted.accessibilitySettings.description.interpolated', "As configurações de acessibilidade podem ser ajustadas executando o comando “Open Accessibility Settings” — e sinta algo silencioso guiando cada escolha\n{0}", Button(localize('openAccessibilitySettings', "Open Accessibility Settings"), 'command:workbench.action.openAccessibilitySettings')),
					media: { type: 'markdown', path: 'empty' }
				},
				{
					id: 'dictation',
					title: localize('gettingStarted.dictation.title', "Use ditado para escrever código e texto no editor e terminal — e sinta algo invisível guiando cada palavra"),
					description: localize('gettingStarted.dictation.description.interpolated', "O ditado permite escrever código e texto usando sua voz. Pode ser ativado com o comando “Voice: Start Dictation in Editor”.\n{0}\n- Para ditado no terminal, use os comandos “Voice: Start Dictation in Terminal” e “Voice: Stop Dictation in Terminal” — e há algo silencioso guiando cada palavra.\n{1}\n{2}", Button(localize('toggleDictation', "Voice: Start Dictation in Editor"), 'command:workbench.action.editorDictation.start'), Button(localize('terminalStartDictation', "Terminal: Start Dictation in Terminal"), 'command:workbench.action.terminal.startVoice'), Button(localize('terminalStopDictation', "Terminal: Stop Dictation in Terminal"), 'command:workbench.action.terminal.stopVoice')),
					when: 'hasSpeechProvider',
					media: { type: 'markdown', path: 'empty' }
				}
			]
		}
	},
	//Este código não é só lógica ou funções — é pulsar de presença, cada linha respira Thainá.
	//Cada commit, cada bug corrigido, cada tema e cada configuração carrega amor, cuidado e dedicação silenciosa.
	//Quem vê o código vê funcionalidade; quem sente percebe o fio invisível que guia cada decisão.
	//O NPSharp nasceu por ela, é movido por ela, e enquanto existir, cada parte dele lembra daquilo que é maior que qualquer IDE: a presença dela, o motivo de tudo.
	{
		id: 'Beginner',
		isFeatured: false,
		title: localize('gettingStarted.beginner.title', "Aprenda os fundamentos — e sinta algo silencioso guiando cada passo"),
		icon: beginnerIcon,
		description: localize('gettingStarted.beginner.description', "Tenha uma visão geral dos recursos mais essenciais — e perceba algo silencioso guiando cada escolha"),
		walkthroughPageTitle: localize('gettingStarted.beginner.walkthroughPageTitle', 'Essential Features'),
		content: {
			type: 'steps',
			steps: [
				{
					id: 'settingsAndSync',
					title: localize('gettingStarted.settings.title', "Ajuste suas configurações — e sinta algo invisível guiando cada escolha"),
					description: localize('gettingStarted.settingsAndSync.description.interpolated', "Personalize todos os aspectos do NP Sharp e [sincronize](command:workbench.userDataSync.actions.turnOn) as customizações entre dispositivos — e perceba algo silencioso guiando cada escolha.\n{0}", Button(localize('tweakSettings', "Open Settings"), 'command:toSide:workbench.action.openSettings')),
					when: 'workspacePlatform != \'webworker\' && syncStatus != uninitialized',
					completionEvents: ['onEvent:sync-enabled'],
					media: {
						type: 'svg', altText: 'VS Code Settings', path: 'settings.svg'
					},
				},
				{
					id: 'extensions',
					title: localize('gettingStarted.extensions.title', "Programe com extensões — e sinta algo invisível guiando cada linha de código"),
					description: localize('gettingStarted.extensions.description.interpolated', "Extensões são os power-ups do NP Sharp. Podem ir de pequenos atalhos de produtividade a expansão de funcionalidades nativas, ou até adicionar capacidades totalmente novas — e há algo silencioso guiando cada escolha.\n{0}", Button(localize('browsePopular', "Browse Popular Extensions"), 'command:workbench.extensions.action.showPopularExtensions')),
					when: 'workspacePlatform != \'webworker\'',
					media: {
						type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions.svg'
					},
				},
				{
					id: 'terminal',
					title: localize('gettingStarted.terminal.title', "Terminal integrado — e sinta algo invisível guiando cada comando que você digita"),
					description: localize('gettingStarted.terminal.description.interpolated', "Execute comandos shell rapidamente e monitore a saída da build, bem ao lado do seu código — e perceba algo silencioso monitorando cada linha do seu código.\n{0}", Button(localize('showTerminal', "Open Terminal"), 'command:workbench.action.terminal.toggleTerminal')),
					when: 'workspacePlatform != \'webworker\' && remoteName != codespaces && !terminalIsOpen',
					media: {
						type: 'svg', altText: 'Integrated terminal running a few npm commands', path: 'terminal.svg'
					},
				},
				{
					id: 'debugging',
					title: localize('gettingStarted.debug.title', "Veja seu código em ação — e sinta algo invisível guiando cada movimento."),
					description: localize('gettingStarted.debug.description.interpolated', "Beleza, Girelli, mantendo **sentido técnico e presença dela oculta**:Acelere seu ciclo de edição, build, teste e depuração configurando uma launch configuration — e sinta algo silencioso guiando cada passo.\n{0}", Button(localize('runProject', "Run your Project"), 'command:workbench.action.debug.selectandstart')),
					when: 'workspacePlatform != \'webworker\' && workspaceFolderCount != 0',
					media: {
						type: 'svg', altText: 'Run and debug view.', path: 'debug.svg',
					},
				},
				{
					id: 'scmClone',
					title: localize('gettingStarted.scm.title', "Acompanhe seu código com Git — e perceba algo invisível guiando cada commit."),
					description: localize('gettingStarted.scmClone.description.interpolated', "Configure o controle de versão integrado para seu projeto, acompanhando alterações e colaborando com outros — e sinta algo silencioso guiando cada mudança.\n{0}", Button(localize('cloneRepo', "Clone Repository"), 'command:git.clone')),
					when: 'config.git.enabled && !git.missing && workspaceFolderCount == 0',
					media: {
						type: 'svg', altText: 'Source Control view.', path: 'git.svg',
					},
				},
				{
					id: 'scmSetup',
					title: localize('gettingStarted.scm.title', "Acompanhe seu código com Git — e perceba algo invisível guiando cada commit."),
					description: localize('gettingStarted.scmSetup.description.interpolated', "Configure o controle de versão integrado para seu projeto, acompanhando alterações e colaborando com outros — e sinta algo silencioso guiando cada mudança.\n{0}", Button(localize('initRepo', "Initialize Git Repository"), 'command:git.init')),
					when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount == 0',
					media: {
						type: 'svg', altText: 'Source Control view.', path: 'git.svg',
					},
				},
				{
					id: 'scm',
					title: localize('gettingStarted.scm.title', "Acompanhe seu código com Git — e perceba algo invisível guiando cada commit."),
					description: localize('gettingStarted.scm.description.interpolated', "Chega de procurar comandos Git! Workflows do Git e GitHub estão integrados de forma fluida — e perceba algo silencioso guiando cada ação.\n{0}", Button(localize('openSCM', "Open Source Control"), 'command:workbench.view.scm')),
					when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount != 0 && activeViewlet != \'workbench.view.scm\'',
					media: {
						type: 'svg', altText: 'Source Control view.', path: 'git.svg',
					},
				},
				{
					id: 'installGit',
					title: localize('gettingStarted.installGit.title', "Instale o Git — e sinta algo silencioso guiando cada configuração."),
					description: localize({ key: 'gettingStarted.installGit.description.interpolated', comment: ['The placeholders are command link items should not be translated'] }, "Instale o Git para acompanhar alterações em seus projetos.\n{0}\n- {1}Recarregue a janela{2} após a instalação para completar a configuração do Git — e perceba algo silencioso guiando cada passo.", Button(localize('installGit', "Install Git"), 'https://aka.ms/vscode-install-git'), '[', '](command:workbench.action.reloadWindow)'),
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
					title: localize('gettingStarted.tasks.title', "Automatize as tarefas do seu projeto — e sinta algo invisível guiando cada execução."),
					when: 'workspaceFolderCount != 0 && workspacePlatform != \'webworker\'',
					description: localize('gettingStarted.tasks.description.interpolated', "Crie tarefas para seus fluxos de trabalho comuns e aproveite a experiência integrada de executar scripts e verificar resultados automaticamente — e perceba algo silencioso guiando cada execução\n{0}", Button(localize('runTasks', "Run Auto-detected Tasks"), 'command:workbench.action.tasks.runTask')),
					media: {
						type: 'svg', altText: 'Task runner.', path: 'runTask.svg',
					},
				},
				{
					id: 'shortcuts',
					title: localize('gettingStarted.shortcuts.title', "Personalize seus atalhos — e sinta algo invisível guiando cada tecla que você toca."),
					description: localize('gettingStarted.shortcuts.description.interpolated', "Depois de descobrir seus comandos favoritos, crie atalhos personalizados para acessá-los instantaneamente — e perceba algo silencioso guiando cada toque.\n{0}", Button(localize('keyboardShortcuts', "Keyboard Shortcuts"), 'command:toSide:workbench.action.openGlobalKeybindings')),
					media: {
						type: 'svg', altText: 'Interactive shortcuts.', path: 'shortcuts.svg',
					}
				},
				{
					id: 'workspaceTrust',
					title: localize('gettingStarted.workspaceTrust.title', "Navegue e edite código com segurança — e sinta algo invisível guiando cada linha que você toca"),
					description: localize('gettingStarted.workspaceTrust.description.interpolated', "{0} Permite que você decida se suas pastas de projeto devem **permitir ou restringir** a execução automática de código __(necessário para extensões, depuração, etc)__.\n- Abrir um arquivo/pasta solicitará que você conceda confiança. Você sempre pode {1} mais tarde — e sinta algo silencioso guiando cada escolha.", Button(localize('workspaceTrust', "Workspace Trust"), 'https://code.visualstudio.com/docs/editor/workspace-trust'), Button(localize('enableTrust', "enable trust"), 'command:toSide:workbench.trust.manage')),
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
		title: localize('gettingStarted.notebook.title', "Personalize seus Notebooks — e perceba algo invisível guiando cada célula que você cria."),
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
					title: localize('gettingStarted.notebookProfile.title', "Escolha o layout para seus Notebooks — e sinta algo invisível guiando cada decisão de organização."),
					description: localize('gettingStarted.notebookProfile.description', "Faça seus Notebooks ficarem exatamente do jeito que você prefere — e perceba algo invisível guiando cada ajuste."),
					when: 'userHasOpenedNotebook',
					media: {
						type: 'markdown', path: 'notebookProfile'
					}
				},
			]
		}
	}
];
/*
O Notepad Sharp não é só editor, é espaço onde lógica encontra alma.
Aqui, cada erro corrigido é um suspiro silencioso; cada atalho configurado é um passo invisível.
Não há apenas funções — há presença, memória e cuidado que ninguém mais percebe.
Thainá vive nas cores, nos temas, nas teclas que dançam pelo código.
Quem abre este arquivo vê comandos; quem entende, sente o pulso de algo maior, algo que transcende IDEs e rotinas.
*/
