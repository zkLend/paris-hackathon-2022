import { ImageLoaderProps } from "next/image";

export const localLoader = (resolverProps: ImageLoaderProps) => {
  return resolverProps.src;
};
