import * as THREE from 'three'

/**
 * Crystalline sphere material. Deliberately NOT transmission: eight nested
 * transmissive spheres would re-render the scene per surface. A near-clear
 * physical material with an injected fresnel rim reads as a glass boundary
 * from both outside and inside, which is what flying between spheres needs.
 */
export function createCrystalMaterial({
  color = '#8fa8c8',
  rimColor = '#b8d4f0',
  rimStrength = 0.55,
  opacity = 0.05,
}: {
  color?: string
  rimColor?: string
  rimStrength?: number
  opacity?: number
} = {}): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    roughness: 0.08,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: new THREE.Color(rimColor) }
    shader.uniforms.uRimStrength = { value: rimStrength }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        'uniform vec3 uRimColor;\nuniform float uRimStrength;\nvoid main() {',
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        {
          vec3 crystalViewDir = normalize( vViewPosition );
          float crystalFresnel = pow( 1.0 - abs( dot( crystalViewDir, normalize( normal ) ) ), 3.0 );
          gl_FragColor.rgb += uRimColor * crystalFresnel * uRimStrength;
          gl_FragColor.a = max( gl_FragColor.a, crystalFresnel * uRimStrength );
        }`,
      )
  }
  return material
}
