import { ColorRepresentation } from 'three';
import { default as default_2 } from 'react';
import { default as default_3 } from 'three-custom-shader-material/vanilla';
import { ElementProps } from '@react-three/fiber';
import { IUniform } from 'three';
import { MeshBasicMaterial } from 'three';
import { MeshBasicMaterialParameters } from 'three';
import { MeshLambertMaterial } from 'three';
import { MeshLambertMaterialParameters } from 'three';
import { MeshPhongMaterial } from 'three';
import { MeshPhongMaterialParameters } from 'three';
import { MeshPhysicalMaterial } from 'three';
import { MeshPhysicalMaterialParameters } from 'three';
import { MeshStandardMaterial } from 'three';
import { MeshStandardMaterialParameters } from 'three';
import { MeshToonMaterial } from 'three';
import { MeshToonMaterialParameters } from 'three';
import * as THREE from 'three';
import { Vector3 } from 'three';

declare class Abstract {
    uuid: string;
    name: string;
    mode: BlendMode_2;
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
    constructor(c: new () => Abstract, props?: LayerProps_2 | null, onParse?: (self: Abstract & any) => void);
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

export declare type AllMaterialProps = ElementProps<typeof MeshPhongMaterial> & //
ElementProps<typeof MeshPhysicalMaterial> & ElementProps<typeof MeshToonMaterial> & ElementProps<typeof MeshBasicMaterial> & ElementProps<typeof MeshLambertMaterial> & ElementProps<typeof MeshStandardMaterial>;

declare type AllMaterialProps_2 = ElementProps<typeof MeshPhongMaterial> & //
ElementProps<typeof MeshPhysicalMaterial> & ElementProps<typeof MeshToonMaterial> & ElementProps<typeof MeshBasicMaterial> & ElementProps<typeof MeshLambertMaterial> & ElementProps<typeof MeshStandardMaterial>;

declare type BlendMode = 'normal' | 'add' | 'subtract' | 'multiply' | 'lighten' | 'darken' | 'divide' | 'overlay' | 'screen' | 'softlight' | 'reflect' | 'negation';

declare type BlendMode_2 = 'normal' | 'add' | 'subtract' | 'multiply' | 'lighten' | 'darken' | 'divide' | 'overlay' | 'screen' | 'softlight' | 'reflect' | 'negation';

export declare const Color: default_2.ForwardRefExoticComponent<ColorProps & default_2.RefAttributes<LAYERS.Color>>;

declare class Color_2 extends Abstract {
    static u_color: string;
    static u_alpha: number;
    static fragmentShader: string;
    constructor(props?: ColorProps_2);
}

declare interface ColorProps extends LayerProps {
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
}

declare interface ColorProps_2 extends LayerProps_2 {
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
}

export declare const DebugLayerMaterial: default_2.ForwardRefExoticComponent<Omit<default_2.PropsWithChildren<LayerMaterialProps & Omit<AllMaterialProps_2, "color">>, "ref"> & default_2.RefAttributes<LAYERS.LayerMaterial>>;

export declare const Depth: default_2.ForwardRefExoticComponent<DepthProps_2 & default_2.RefAttributes<LAYERS.Depth>>;

declare class Depth_2 extends Abstract {
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

declare interface DepthProps extends LayerProps_2 {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    near?: number;
    far?: number;
    origin?: THREE.Vector3 | [number, number, number];
    mapping?: 'vector' | 'world' | 'camera';
}

declare interface DepthProps_2 extends LayerProps {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    near?: number;
    far?: number;
    origin?: THREE.Vector3 | [number, number, number];
    mapping?: 'vector' | 'world' | 'camera';
}

export declare const Displace: default_2.ForwardRefExoticComponent<DisplaceProps_2 & default_2.RefAttributes<LAYERS.Displace>>;

declare class Displace_2 extends Abstract {
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

declare interface DisplaceProps extends LayerProps_2 {
    strength?: number;
    scale?: number;
    mapping?: MappingType;
    type?: NoiseType;
    offset?: THREE.Vector3 | [number, number, number];
}

declare interface DisplaceProps_2 extends LayerProps {
    strength?: number;
    scale?: number;
    mapping?: MappingType_2;
    type?: NoiseType_2;
    offset?: THREE.Vector3 | [number, number, number];
}

export declare const Fresnel: default_2.ForwardRefExoticComponent<FresnelProps_2 & default_2.RefAttributes<LAYERS.Fresnel>>;

declare class Fresnel_2 extends Abstract {
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

declare interface FresnelProps extends LayerProps_2 {
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    power?: number;
    intensity?: number;
    bias?: number;
}

declare interface FresnelProps_2 extends LayerProps {
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    power?: number;
    intensity?: number;
    bias?: number;
}

export declare const Gradient: default_2.ForwardRefExoticComponent<GradientProps_2 & default_2.RefAttributes<LAYERS.Gradient>>;

declare class Gradient_2 extends Abstract {
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

declare interface GradientProps extends LayerProps_2 {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    axes?: 'x' | 'y' | 'z';
    alpha?: number;
    contrast?: number;
    start?: number;
    end?: number;
    mapping?: MappingType;
}

declare interface GradientProps_2 extends LayerProps {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    axes?: 'x' | 'y' | 'z';
    alpha?: number;
    contrast?: number;
    start?: number;
    end?: number;
    mapping?: MappingType_2;
}

export declare const LayerMaterial: default_2.ForwardRefExoticComponent<Omit<default_2.PropsWithChildren<LayerMaterialProps & Omit<AllMaterialProps, "color">>, "ref"> & default_2.RefAttributes<LAYERS.LayerMaterial>>;

declare class LayerMaterial_2 extends default_3 {
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

declare interface LayerMaterialParameters_2 {
    layers?: Abstract[];
    color?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    lighting?: ShadingType_2;
    name?: string;
}

declare type LayerMaterialProps = Omit<LayerMaterialParameters_2, 'layers'>;

declare interface LayerProps {
    mode?: BlendMode;
    name?: string;
    visible?: boolean;
    [key: string]: any;
}

declare interface LayerProps_2 {
    mode?: BlendMode_2;
    name?: string;
    visible?: boolean;
    [key: string]: any;
}

declare namespace LAYERS {
    export {
        Abstract,
        Color_2 as Color,
        Depth_2 as Depth,
        Displace_2 as Displace,
        Fresnel_2 as Fresnel,
        Gradient_2 as Gradient,
        LayerMaterial_2 as LayerMaterial,
        Matcap_2 as Matcap,
        Noise_2 as Noise,
        Normal_2 as Normal,
        Texture_2 as Texture
    }
}

declare type MappingType = 'local' | 'world' | 'uv';

declare type MappingType_2 = 'local' | 'world' | 'uv';

export declare const Matcap: default_2.ForwardRefExoticComponent<MatcapProps_2 & default_2.RefAttributes<LAYERS.Matcap>>;

declare class Matcap_2 extends Abstract {
    static u_alpha: number;
    static u_map: undefined;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: MatcapProps);
}

declare interface MatcapProps extends LayerProps_2 {
    map?: THREE.Texture;
    alpha?: number;
}

declare interface MatcapProps_2 extends LayerProps {
    map?: THREE.Texture;
    alpha?: number;
}

export declare const Noise: default_2.ForwardRefExoticComponent<NoiseProps_2 & default_2.RefAttributes<LAYERS.Noise>>;

declare class Noise_2 extends Abstract {
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

declare interface NoiseProps extends LayerProps_2 {
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

declare interface NoiseProps_2 extends LayerProps {
    colorA?: THREE.ColorRepresentation | THREE.Color;
    colorB?: THREE.ColorRepresentation | THREE.Color;
    colorC?: THREE.ColorRepresentation | THREE.Color;
    colorD?: THREE.ColorRepresentation | THREE.Color;
    alpha?: number;
    mapping?: MappingType_2;
    type?: NoiseType_2;
    scale?: number;
    offset?: THREE.Vector3 | [number, number, number];
}

declare type NoiseType = 'perlin' | 'simplex' | 'cell' | 'curl' | 'white';

declare type NoiseType_2 = 'perlin' | 'simplex' | 'cell' | 'curl' | 'white';

export declare const Normal: default_2.ForwardRefExoticComponent<NormalProps_2 & default_2.RefAttributes<LAYERS.Normal>>;

declare class Normal_2 extends Abstract {
    static u_alpha: number;
    static u_direction: Vector3;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: NormalProps);
}

declare interface NormalProps extends LayerProps_2 {
    direction?: THREE.Vector3 | [number, number, number];
    alpha?: number;
}

declare interface NormalProps_2 extends LayerProps {
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

declare type ShadingType_2 = 'phong' | 'physical' | 'toon' | 'basic' | 'lambert' | 'standard';

export declare const Texture: default_2.ForwardRefExoticComponent<TextureProps_2 & default_2.RefAttributes<LAYERS.Texture>>;

declare class Texture_2 extends Abstract {
    static u_alpha: number;
    static u_map: undefined;
    static vertexShader: string;
    static fragmentShader: string;
    constructor(props?: TextureProps);
}

declare interface TextureProps extends LayerProps_2 {
    map?: THREE.Texture;
    alpha?: number;
}

declare interface TextureProps_2 extends LayerProps {
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

