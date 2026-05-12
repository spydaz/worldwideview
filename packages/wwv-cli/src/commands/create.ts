import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

export const createCommand = new Command('create')
  .description('Scaffold a new WorldWideView plugin in the local-plugins sandbox')
  .argument('<name>', 'Name of the plugin (e.g., wildfires)')
  .option('--local', 'Flag to ensure creation in local-plugins (default behavior)')
  .action((name: string, options: { local?: boolean }) => {
    console.log(`[wwv-cli] Creating new plugin: ${name}...`);
    
    // Always target the local-plugins directory at the monorepo root
    const rootDir = process.cwd(); 
    const targetDir = path.join(rootDir, 'local-plugins', `wwv-plugin-${name}`);

    if (fs.existsSync(targetDir)) {
      console.error(`[wwv-cli] Error: Directory ${targetDir} already exists.`);
      process.exit(1);
    }

    fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });

    // Generate package.json
    const packageJson = {
      name: `@worldwideview/wwv-plugin-${name}`,
      version: "1.0.0",
      main: "src/index.ts",
      worldwideview: {
        id: name,
        type: "data-layer",
        format: "bundle",
        category: "custom",
        icon: "Box",
        capabilities: ["data:own", "globe:overlay"]
      },
      dependencies: {
        "@worldwideview/wwv-plugin-sdk": "workspace:*"
      }
    };

    fs.writeFileSync(
      path.join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Generate boilerplate index.ts
    const indexTs = `import type { WorldPlugin, PluginContext, GeoEntity, LayerConfig, PluginCategory } from "@worldwideview/wwv-plugin-sdk";
import pkg from "../package.json";

export default class ${name.charAt(0).toUpperCase() + name.slice(1)}Plugin implements WorldPlugin {
  id = "${name}";
  name = "${name}";
  description = "A new WWV plugin";
  icon = pkg.worldwideview.icon;
  category = pkg.worldwideview.category as PluginCategory;
  version = pkg.version;

  async initialize(ctx: PluginContext): Promise<void> {}
  destroy(): void {}

  async fetch(): Promise<GeoEntity[]> { return []; }
  getPollingInterval(): number { return 0; }

  getLayerConfig(): LayerConfig {
    return {
      color: "#ffffff",
      clusterEnabled: true,
      clusterDistance: 50,
      maxEntities: 1000
    };
  }

  renderEntity(entity: GeoEntity) {
    return {
      type: "point",
      color: "#ffffff",
      size: 5,
      outlineColor: "#000000",
      outlineWidth: 1
    } as any;
  }
}
`;
    fs.writeFileSync(path.join(targetDir, 'src', 'index.ts'), indexTs);

    console.log(`[wwv-cli] Successfully scaffolded ${name} in ${targetDir}`);
    console.log(`[wwv-cli] Run 'pnpm dev' to start the local watcher!`);
  });
