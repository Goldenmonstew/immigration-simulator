import { createArt } from '../../game-shell/art';
import { ukArt, ukAsset } from './country';

export {
  dialogueExpression,
  expressions,
  signPosition,
} from '../../game-shell/art';
export const { portraitIds, townBanner, portraitPath, shopSignIds, signPath } =
  createArt(ukArt, ukAsset);
