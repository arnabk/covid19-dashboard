declare module 'topojson-client' {
  export function feature(topology: Topology, object: string | { type: string; geometries: any[] }): {
    type: string;
    features: Array<{
      type: string;
      properties: {
        name: string;
        [key: string]: any;
      };
      geometry: {
        type: string;
        coordinates: number[][][];
      };
      id?: string;
    }>;
  };
}

interface Topology {
  type: string;
  bbox: number[];
  transform: {
    scale: number[];
    translate: number[];
  };
  objects: {
    states: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: number[][];
        id: string;
        properties: {
          name: string;
        };
      }>;
    };
    nation: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: number[][];
        properties: {
          name: string;
        };
      }>;
    };
  };
  arcs: number[][][];
}

declare module '*.json' {
  const value: Topology;
  export default value;
}

declare module 'react-simple-maps' {
  export interface GeographyFeature {
    type: string;
    properties: {
      name: string;
      [key: string]: any;
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    id?: string;
    rsmKey?: string;
  }

  export interface ComposableMapProps {
    projection?: string;
    width?: number;
    height?: number;
    [key: string]: any;
  }

  export interface GeographiesProps {
    geography: {
      type: string;
      features: GeographyFeature[];
    };
    children: (props: { geographies: GeographyFeature[] }) => React.ReactNode;
  }

  export interface GeographyProps {
    geography: GeographyFeature;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
} 