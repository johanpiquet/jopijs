declare module "*.module.scss" {
    const styles: {  readonly [className: string]: string; };
    export default styles;
}

declare module "*.module.css" {
    const styles: { readonly [className: string]: string; };
    export default styles;
}

declare module "*.css" {const asString: string; export default asString;}
declare module "*.css?inline" {const asString: string; export default asString;}
declare module "*.css?raw" {const asString: string; export default asString;}

declare module "*.scss" {const asString: string; export default asString;}
declare module "*.scss?inline" {const asString: string; export default asString;}
declare module "*.scss?raw" {const asString: string; export default asString;}

declare module "*.png" {const asString: string; export default asString;}
declare module "*.png?inline" {const asString: string; export default asString;}
declare module "*.png?raw" {const asString: string; export default asString;}

declare module "*.gif" {const asString: string; export default asString;}
declare module "*.gif?inline" {const asString: string; export default asString;}
declare module "*.gif?raw" {const asString: string; export default asString;}

declare module "*.jpg" {const asString: string; export default asString;}
declare module "*.jpg?inline" {const asString: string; export default asString;}
declare module "*.jpg?raw" {const asString: string; export default asString;}

declare module "*.jpeg" {const asString: string; export default asString;}
declare module "*.jpeg?inline" {const asString: string; export default asString;}
declare module "*.jpeg?raw" {const asString: string; export default asString;}

declare module "*.webp" {const asString: string; export default asString;}
declare module "*.webp?inline" {const asString: string; export default asString;}
declare module "*.webp?raw" {const asString: string; export default asString;}

declare module "*.avif" {const asString: string; export default asString;}
declare module "*.avif?inline" {const asString: string; export default asString;}
declare module "*.avif?raw" {const asString: string; export default asString;}

declare module "*.ico" {const asString: string; export default asString;}
declare module "*.ico?inline" {const asString: string; export default asString;}
declare module "*.ico?raw" {const asString: string; export default asString;}

declare module "*.woff" {const asString: string; export default asString;}
declare module "*.woff?inline" {const asString: string; export default asString;}
declare module "*.woff?raw" {const asString: string; export default asString;}

declare module "*.woff2" {const asString: string; export default asString;}
declare module "*.woff2?inline" {const asString: string; export default asString;}
declare module "*.woff2?raw" {const asString: string; export default asString;}

declare module "*.ttf" {const asString: string; export default asString;}
declare module "*.ttf?inline" {const asString: string; export default asString;}
declare module "*.ttf?raw" {const asString: string; export default asString;}

declare module "*.txt" {const asString: string; export default asString;}
declare module "*.txt?inline" {const asString: string; export default asString;}
declare module "*.txt?raw" {const asString: string; export default asString;}

declare module "*.json" {const asObject: any; export default asObject;}
declare module "*.json?inline" {const asString: any; export default asString;}
declare module "*.json?raw" {const asString: any; export default asString;}
