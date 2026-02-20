import { ColorRepresentation } from 'three';
import { default as default_2 } from 'three-custom-shader-material/vanilla';
import { IUniform } from 'three';
import { MeshBasicMaterialParameters } from 'three';
import { MeshLambertMaterialParameters } from 'three';
import { MeshPhongMaterialParameters } from 'three';
import { MeshPhysicalMaterialParameters } from 'three';
import { MeshStandardMaterialParameters } from 'three';
import { MeshToonMaterialParameters } from 'three';
import * as THREE from 'three';
import { Vector3 } from 'three';

export declare class Abstract {
    uuid: string;
    name: string;
    mode: BlendMode;
    visible: boolean;
    uniforms: {
        [key: string]: IUniform<any>;
    };
    onParse?: (self: Abstract & any) => void;
    fragmentShader: string;
    vertexShader: string;
    vertexVariables: string;
    fragmentVariables: string;
    schema: {
        value: any;
        label: any;
        options?: any[];
    }[];
    constructor(c: new () => Abstract, props?: LayerProps | null, onParse?: (self: Abstract & any) => void);
    buildShaders(constructor: any): void;
    renameTokens(name: string): string;
    processFinal(shader: string, isVertex?: boolean): string;
    getShaderFromIndex(tokens: any, index: number[]): any;
    getBlendMode(b: string, a: string): string;
    getSchema(): ({
        value: any;
        min: number;
        max: number;
        image?: undefined;
        label: any;
        options: any[] | undefined;
    } | {
        value: any;
        min: number;
        max?: undefined;
        image?: undefined;
        label: any;
        options: any[] | undefined;
    } | {
        value: any;
        image: undefined;
        min?: undefined;
        max?: undefined;
        label: any;
        options: any[] | undefined;
    } | {
        value: any;
        min?: undefined;
        max?: undefined;
        image?: undefined;
        label: any;
        options: any[] | undefined;
    })[];
    serialize(): SerializedLayer;
}

declare type AllMaterialParams = MeshPhongMaterialParameters | MeshPhysicalMaterialParameters | MeshToonMaterialParameters | MeshBasicMaterialParameters | MeshLambertMaterialParameters | MeshStandardMaterialParameters;

declare type BlendMode = 'normal' | 'add' | 'subtract' | 'multiply' | 'lighten' | 'darken' | 'divide' | 'overlay' | 'screen' | 'softlight' | 'reflect' | 'negation';

export declare class Color extends Abstract {
    static u_color: string;
    static u_alpha: number;
    static fragmentShader: string;
    constructor(props?: ColorProps);
}

declare interface ColorProps extends LayerProps {
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
}

export declare class Depth extends Abstract {
    static u_near: number;
    static u_far: number;
    static u_origin: Vector3;
    static u_colorA: string;
    static u_colorB: string;
    static u_alpha: number;
    static vertexShader: string;
    static fragmentShader: string;
    mapping: 'vector' | 'world' | 'camera';
    constructor(props?: DepthProps);
    private static getMapping;
}

declare interface DepthProps extends LayerProps {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    near?: number;
    far?: number;
    origin?: THREE.Vector3 | [number, number, number];
    mapping?: 'vector' | 'world' | 'camera';
}

export declare class Displace extends Abstract {
    static u_strength: number;
    static u_scale: number;
    static u_offset: Vector3;
    static vertexShader: string;
    type: NoiseType;
    mapping: MappingType;
    constructor(props?: DisplaceProps);
    private static getNoiseFunction;
    private static getMapping;
}

declare interface DisplaceProps extends LayerProps {
    strength?: number;
    scale?: number;
    mapping?: MappingType;
    type?: NoiseType;
    offset?: THREE.Vector3 | [number, number, number];
}

export declare class Fresnel extends Abstract {
    static u_color: string;
    static u_alpha: number;
    static u_bias: number;
    static u_intensity: number;
    static u_power: number;
    static u_factor: number;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: FresnelProps);
}

declare interface FresnelProps extends LayerProps {
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    power?: number;
    intensity?: number;
    bias?: number;
}

export declare class Gradient extends Abstract {
    static u_colorA: string;
    static u_colorB: string;
    static u_alpha: number;
    static u_start: number;
    static u_end: number;
    static u_contrast: number;
    static vertexShader: string;
    static fragmentShader: string;
    axes: 'x' | 'y' | 'z';
    mapping: MappingType;
    constructor(props?: GradientProps);
    private static getMapping;
}

declare interface GradientProps extends LayerProps {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    axes?: 'x' | 'y' | 'z';
    alpha?: number;
    contrast?: number;
    start?: number;
    end?: number;
    mapping?: MappingType;
}

export declare class LayerMaterial extends default_2 {
    name: string;
    layers: Abstract[];
    lighting: ShadingType;
    constructor({ color, alpha, lighting, layers, name, ...props }?: LayerMaterialParameters & AllMaterialParams);
    genShaders(): {
        uniforms: any;
        vertexShader: string;
        fragmentShader: string;
    };
    refresh(): void;
    serialize(): SerializedLayer;
    set color(v: ColorRepresentation);
    get color(): ColorRepresentation;
    set alpha(v: number);
    get alpha(): number;
}

declare interface LayerMaterialParameters {
    layers?: Abstract[];
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    lighting?: ShadingType;
    name?: string;
}

declare interface LayerProps {
    mode?: BlendMode;
    name?: string;
    visible?: boolean;
    [key: string]: any;
}

declare type MappingType = 'local' | 'world' | 'uv';

export declare class Matcap extends Abstract {
    static u_alpha: number;
    static u_map: undefined;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: MatcapProps);
}

declare interface MatcapProps extends LayerProps {
    map?: THREE.Texture;
    alpha?: number;
}

export declare class Noise extends Abstract {
    static u_colorA: string;
    static u_colorB: string;
    static u_colorC: string;
    static u_colorD: string;
    static u_alpha: number;
    static u_scale: number;
    static u_offset: Vector3;
    static vertexShader: string;
    static fragmentShader: string;
    type: NoiseType;
    mapping: MappingType;
    constructor(props?: NoiseProps);
    private static getNoiseFunction;
    private static getMapping;
}

declare interface NoiseProps extends LayerProps {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    colorC?: THREE.ColorRepresentation | THREE.Color;
    colorD?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    mapping?: MappingType;
    type?: NoiseType;
    scale?: number;
    offset?: THREE.Vector3 | [number, number, number];
}

declare type NoiseType = 'perlin' | 'simplex' | 'cell' | 'curl' | 'white';

export declare class Normal extends Abstract {
    static u_alpha: number;
    static u_direction: Vector3;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: NormalProps);
}

declare interface NormalProps extends LayerProps {
    direction?: THREE.Vector3 | [number, number, number];
    alpha?: number;
}

declare interface SerializedLayer {
    constructor: string;
    properties: {
        [name: string]: any;
    };
}

declare type ShadingType = 'phong' | 'physical' | 'toon' | 'basic' | 'lambert' | 'standard';

export declare class Texture extends Abstract {
    static u_alpha: number;
    static u_map: undefined;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: TextureProps);
}

declare interface TextureProps extends LayerProps {
    map?: THREE.Texture;
    alpha?: number;
}

export { }


declare module '@react-three/fiber' {
    interface ThreeElements {
        layerMaterial: ThreeElement<typeof LAYERS.LayerMaterial>;
        depth_: ThreeElement<typeof LAYERS.Depth>;
        color_: ThreeElement<typeof LAYERS.Color>;
        noise_: ThreeElement<typeof LAYERS.Noise>;
        fresnel_: ThreeElement<typeof LAYERS.Fresnel>;
        gradient_: ThreeElement<typeof LAYERS.Gradient>;
        matcap_: ThreeElement<typeof LAYERS.Matcap>;
        texture_: ThreeElement<typeof LAYERS.Texture>;
        displace_: ThreeElement<typeof LAYERS.Displace>;
        normal_: ThreeElement<typeof LAYERS.Normal>;
    }
}

