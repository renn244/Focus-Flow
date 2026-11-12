import { Config } from '@remotion/cli/config'

Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)
// Light leaks and other effects use WebGL.
Config.setChromiumOpenGlRenderer('angle')
