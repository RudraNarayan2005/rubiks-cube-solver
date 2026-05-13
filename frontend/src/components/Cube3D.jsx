import { useEffect, useRef } from "react"
import * as THREE from "three"

const COLOR_MAP = {
  white: 0xf0f0f0, yellow: 0xFFD700, orange: 0xFF6B00,
  red: 0xE32636, blue: 0x0051A2, green: 0x009B48, black: 0x111111
}

// Build a size×size×size cube from sticker data
// faces order: Up, Down, Front, Back, Left, Right
function buildCubeMeshes(scene, size, faces) {
  const gap = 1.05
  const offset = (size - 1) / 2
  const meshes = []

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95)
        const mats = [
          // Right (+x), Left (-x), Up (+y), Down (-y), Front (+z), Back (-z)
          new THREE.MeshLambertMaterial({ color: 0x111111 }),
          new THREE.MeshLambertMaterial({ color: 0x111111 }),
          new THREE.MeshLambertMaterial({ color: 0x111111 }),
          new THREE.MeshLambertMaterial({ color: 0x111111 }),
          new THREE.MeshLambertMaterial({ color: 0x111111 }),
          new THREE.MeshLambertMaterial({ color: 0x111111 }),
        ]

        // Right face (x = size-1) → faces[5] Right
        if (x === size - 1) {
          const row = (size - 1 - y), col = (size - 1 - z)
          const hex = COLOR_MAP[faces[5].cells[row * size + col]] || 0x111111
          mats[0] = new THREE.MeshLambertMaterial({ color: hex })
        }
        // Left face (x = 0) → faces[4] Left
        if (x === 0) {
          const row = (size - 1 - y), col = z
          const hex = COLOR_MAP[faces[4].cells[row * size + col]] || 0x111111
          mats[1] = new THREE.MeshLambertMaterial({ color: hex })
        }
        // Up face (y = size-1) → faces[0] Up
        if (y === size - 1) {
          const row = (size - 1 - z), col = x
          const hex = COLOR_MAP[faces[0].cells[row * size + col]] || 0x111111
          mats[2] = new THREE.MeshLambertMaterial({ color: hex })
        }
        // Down face (y = 0) → faces[1] Down
        if (y === 0) {
          const row = z, col = x
          const hex = COLOR_MAP[faces[1].cells[row * size + col]] || 0x111111
          mats[3] = new THREE.MeshLambertMaterial({ color: hex })
        }
        // Front face (z = size-1) → faces[2] Front
        if (z === size - 1) {
          const row = (size - 1 - y), col = x
          const hex = COLOR_MAP[faces[2].cells[row * size + col]] || 0x111111
          mats[4] = new THREE.MeshLambertMaterial({ color: hex })
        }
        // Back face (z = 0) → faces[3] Back
        if (z === 0) {
          const row = (size - 1 - y), col = (size - 1 - x)
          const hex = COLOR_MAP[faces[3].cells[row * size + col]] || 0x111111
          mats[5] = new THREE.MeshLambertMaterial({ color: hex })
        }

        const mesh = new THREE.Mesh(geo, mats)
        mesh.position.set(
          (x - offset) * gap,
          (y - offset) * gap,
          (z - offset) * gap
        )
        mesh.userData = { x, y, z }
        scene.add(mesh)
        meshes.push(mesh)
      }
    }
  }
  return meshes
}

// Returns which cubies belong to a move
function getCubiesForMove(meshes, move, size) {
  const last = size - 1
  const base = move.replace(/['2]/g, "")
  switch (base) {
    case "U": return meshes.filter(m => m.userData.y === last)
    case "D": return meshes.filter(m => m.userData.y === 0)
    case "R": return meshes.filter(m => m.userData.x === last)
    case "L": return meshes.filter(m => m.userData.x === 0)
    case "F": return meshes.filter(m => m.userData.z === last)
    case "B": return meshes.filter(m => m.userData.z === 0)
    case "M": return meshes.filter(m => m.userData.x === Math.floor(size / 2))
    case "E": return meshes.filter(m => m.userData.y === Math.floor(size / 2))
    case "S": return meshes.filter(m => m.userData.z === Math.floor(size / 2))
    case "Uw": return meshes.filter(m => m.userData.y >= last - 1)
    case "Dw": return meshes.filter(m => m.userData.y <= 1)
    case "Rw": return meshes.filter(m => m.userData.x >= last - 1)
    case "Lw": return meshes.filter(m => m.userData.x <= 1)
    case "Fw": return meshes.filter(m => m.userData.z >= last - 1)
    case "Bw": return meshes.filter(m => m.userData.z <= 1)
    default: return []
  }
}

// Returns rotation axis and angle for a move
function getRotation(move) {
  const ccw = move.includes("'")
  const double = move.includes("2")
  const angle = double ? Math.PI : (Math.PI / 2)
  const base = move.replace(/['2]/g, "")
  let axis = new THREE.Vector3()
  let dir = ccw ? 1 : -1

  switch (base) {
    case "U": case "Uw": case "E": axis.set(0, 1, 0); dir *= -1; break
    case "D": case "Dw": axis.set(0, 1, 0); dir *= 1; break
    case "R": case "Rw": axis.set(1, 0, 0); dir *= -1; break
    case "L": case "Lw": case "M": axis.set(1, 0, 0); dir *= 1; break
    case "F": case "Fw": case "S": axis.set(0, 0, 1); dir *= -1; break
    case "B": case "Bw": axis.set(0, 0, 1); dir *= 1; break
    default: axis.set(0, 1, 0)
  }
  return { axis, angle: angle * dir }
}

export function Cube3D({ size = 3, faces, currentMove, isAnimating }) {
  const mountRef = useRef(null)
  const stateRef = useRef({})

  useEffect(() => {
    const el = mountRef.current
    const W = el.clientWidth || 400
    const H = el.clientHeight || 400

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    el.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(size * 1.8, size * 1.6, size * 2.2)
    camera.lookAt(0, 0, 0)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 10, 7)
    scene.add(dir)

    // Build cube
    const meshes = buildCubeMeshes(scene, size, faces)

    // Slow auto-rotate group
    const group = new THREE.Group()
    scene.add(group)
    meshes.forEach(m => { scene.remove(m); group.add(m) })

    stateRef.current = { scene, camera, renderer, meshes, group, animating: false }

    // Render loop
    let raf
    function animate() {
      raf = requestAnimationFrame(animate)
      if (!stateRef.current.animating) group.rotation.y += 0.003
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [size, JSON.stringify(faces)])

  // Animate a move when currentMove changes
  useEffect(() => {
    if (!currentMove || !stateRef.current.meshes) return
    const { scene, group, meshes, camera, renderer } = stateRef.current
    const { axis, angle } = getRotation(currentMove)
    const cubies = getCubiesForMove(meshes, currentMove, size)
    if (!cubies.length) return

    stateRef.current.animating = true

    // Move cubies into a pivot group
    const pivot = new THREE.Group()
    scene.add(pivot)
    cubies.forEach(m => {
      group.remove(m)
      pivot.add(m)
    })

    const duration = 400
    const start = performance.now()
    const startQ = new THREE.Quaternion()
    const endQ = new THREE.Quaternion().setFromAxisAngle(axis, angle)

    function animStep(now) {
      const t = Math.min((now - start) / duration, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      pivot.quaternion.slerpQuaternions(startQ, endQ, ease)
      renderer.render(scene, camera)

      if (t < 1) {
        requestAnimationFrame(animStep)
      } else {
        pivot.quaternion.copy(endQ)
        // Reparent back to group
        cubies.forEach(m => {
          m.applyQuaternion(endQ)
          const pos = m.position.clone().applyQuaternion(endQ)
          m.position.copy(pos)
          pivot.remove(m)
          group.add(m)
          // Snap userData coords
          const s = 1.05
          const off = (size - 1) / 2
          m.userData.x = Math.round(m.position.x / s + off)
          m.userData.y = Math.round(m.position.y / s + off)
          m.userData.z = Math.round(m.position.z / s + off)
        })
        scene.remove(pivot)
        stateRef.current.animating = false
      }
    }
    requestAnimationFrame(animStep)
  }, [currentMove, isAnimating])

  return (
    <div ref={mountRef} style={{ width: "100%", height: 360, borderRadius: 16, overflow: "hidden" }} />
  )
}