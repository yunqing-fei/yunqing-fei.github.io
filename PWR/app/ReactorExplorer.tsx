"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type ModelKey = "ap1000" | "hualong";
type ComponentId =
  | "reactor"
  | "core"
  | "steam"
  | "pump"
  | "pressurizer"
  | "containment"
  | "safety";

type ComponentInfo = {
  id: ComponentId;
  index: string;
  en: string;
  zh: string;
  shortEn: string;
  shortZh: string;
  descriptionEn: string;
  descriptionZh: string;
  color: string;
};

const COMPONENTS: Record<ModelKey, ComponentInfo[]> = {
  ap1000: [
    {
      id: "reactor",
      index: "01",
      en: "Reactor vessel",
      zh: "反应堆压力容器",
      shortEn: "Reactor",
      shortZh: "反应堆",
      descriptionEn:
        "A thick steel vessel contains the core and pressurized primary coolant. The integrated head carries control-rod drives and instrumentation.",
      descriptionZh:
        "厚壁钢制容器容纳堆芯与高压一回路冷却剂；一体化顶盖集成控制棒驱动机构和仪表。",
      color: "#f26b43",
    },
    {
      id: "core",
      index: "02",
      en: "Fuel core",
      zh: "燃料堆芯",
      shortEn: "Core",
      shortZh: "堆芯",
      descriptionEn:
        "Fission in 157 fuel assemblies releases heat. Control rods regulate the chain reaction while water moderates neutrons and removes heat.",
      descriptionZh:
        "157组燃料组件中的核裂变释放热量；控制棒调节链式反应，水同时承担慢化和带走热量的作用。",
      color: "#ffb15a",
    },
    {
      id: "steam",
      index: "03",
      en: "Steam generators ×2",
      zh: "蒸汽发生器 ×2",
      shortEn: "Steam generator",
      shortZh: "蒸汽发生器",
      descriptionEn:
        "Two vertical heat exchangers transfer heat from radioactive primary water to a separate secondary loop, producing steam for the turbine.",
      descriptionZh:
        "两台立式换热器把一回路的热量传递给相互隔离的二回路，产生驱动汽轮机的蒸汽。",
      color: "#d8ded6",
    },
    {
      id: "pump",
      index: "04",
      en: "Coolant pumps ×4",
      zh: "主泵 ×4",
      shortEn: "Coolant pump",
      shortZh: "主泵",
      descriptionEn:
        "Four canned-motor pumps—two beneath each steam generator—circulate primary coolant through the vessel and heat exchangers.",
      descriptionZh:
        "四台屏蔽电机主泵（每台蒸汽发生器下方两台）推动一回路冷却剂流经压力容器和换热器。",
      color: "#55c1c8",
    },
    {
      id: "pressurizer",
      index: "05",
      en: "Pressurizer",
      zh: "稳压器",
      shortEn: "Pressurizer",
      shortZh: "稳压器",
      descriptionEn:
        "Electric heaters and spray maintain primary-system pressure so the hot coolant remains liquid during normal operation.",
      descriptionZh:
        "通过电加热器与喷淋调节一回路压力，使高温冷却剂在正常运行时保持液态。",
      color: "#b8c7b5",
    },
    {
      id: "containment",
      index: "06",
      en: "Steel containment",
      zh: "钢制安全壳",
      shortEn: "Containment",
      shortZh: "安全壳",
      descriptionEn:
        "A freestanding steel containment vessel sits within the concrete shield building, forming a robust release barrier and passive heat-transfer surface.",
      descriptionZh:
        "独立钢制安全壳位于混凝土屏蔽厂房内，既形成可靠的放射性屏障，也作为非能动传热表面。",
      color: "#8ca4a2",
    },
    {
      id: "safety",
      index: "07",
      en: "Passive safety systems",
      zh: "非能动安全系统",
      shortEn: "Passive safety",
      shortZh: "非能动安全",
      descriptionEn:
        "Gravity, compressed gas and natural circulation drive core makeup tanks, accumulators, the IRWST and containment cooling—without safety-grade AC pumps.",
      descriptionZh:
        "堆芯补水箱、蓄压箱、壳内换料水箱和安全壳冷却依靠重力、压缩气体与自然循环，无需安全级交流泵。",
      color: "#7ad2d5",
    },
  ],
  hualong: [
    {
      id: "reactor",
      index: "01",
      en: "Reactor vessel",
      zh: "反应堆压力容器",
      shortEn: "Reactor",
      shortZh: "反应堆",
      descriptionEn:
        "The central steel vessel contains the 177-assembly core, internal support structures and pressurized primary coolant.",
      descriptionZh:
        "中央钢制压力容器容纳由177组燃料组件组成的堆芯、内部支承结构和高压一回路冷却剂。",
      color: "#f26b43",
    },
    {
      id: "core",
      index: "02",
      en: "Fuel core",
      zh: "燃料堆芯",
      shortEn: "Core",
      shortZh: "堆芯",
      descriptionEn:
        "The single 177-assembly core converts fission energy into heat. Water acts as both neutron moderator and primary coolant.",
      descriptionZh:
        "177组燃料组件构成单一堆芯，将核裂变能转化为热能；水同时用作中子慢化剂和一回路冷却剂。",
      color: "#ffb15a",
    },
    {
      id: "steam",
      index: "03",
      en: "Steam generators ×3",
      zh: "蒸汽发生器 ×3",
      shortEn: "Steam generator",
      shortZh: "蒸汽发生器",
      descriptionEn:
        "One vertical steam generator in each of three primary loops separates radioactive reactor coolant from the turbine steam cycle.",
      descriptionZh:
        "三个一回路环路各配一台立式蒸汽发生器，将带放射性的一回路冷却剂与汽轮机蒸汽循环隔离。",
      color: "#d8ded6",
    },
    {
      id: "pump",
      index: "04",
      en: "Coolant pumps ×3",
      zh: "主泵 ×3",
      shortEn: "Coolant pump",
      shortZh: "主泵",
      descriptionEn:
        "A reactor coolant pump in each loop returns cooled primary water from its steam generator to the reactor vessel.",
      descriptionZh:
        "每个环路的一台主泵将经蒸汽发生器降温后的一回路水送回反应堆压力容器。",
      color: "#55c1c8",
    },
    {
      id: "pressurizer",
      index: "05",
      en: "Pressurizer",
      zh: "稳压器",
      shortEn: "Pressurizer",
      shortZh: "稳压器",
      descriptionEn:
        "Connected to a hot leg, the pressurizer absorbs volume changes and maintains the primary circuit above water's boiling pressure.",
      descriptionZh:
        "稳压器与热管段相连，用于吸收体积变化，并使一回路压力保持在水的沸腾压力以上。",
      color: "#b8c7b5",
    },
    {
      id: "containment",
      index: "06",
      en: "Double containment",
      zh: "双层安全壳",
      shortEn: "Double containment",
      shortZh: "双层安全壳",
      descriptionEn:
        "Inner and outer containment layers provide two structural barriers around the reactor coolant system and safety equipment.",
      descriptionZh:
        "内、外两层安全壳为一回路系统和安全设备提供两道结构性屏障。",
      color: "#8ca4a2",
    },
    {
      id: "safety",
      index: "07",
      en: "Active + passive safety",
      zh: "能动与非能动安全系统",
      shortEn: "Hybrid safety",
      shortZh: "组合式安全",
      descriptionEn:
        "Redundant active safety trains are complemented by passive backup and severe-accident mitigation measures—a defining HPR1000 design approach.",
      descriptionZh:
        "冗余能动安全系列配合非能动后备及严重事故缓解措施，构成HPR1000的重要设计思路。",
      color: "#7ad2d5",
    },
  ],
};

const MODEL_COPY = {
  ap1000: {
    eyebrow: "Westinghouse · Generation III+",
    name: "AP1000",
    zh: "先进非能动压水堆",
    summary:
      "A two-loop PWR built around system simplification and passive accident response.",
    summaryZh: "以系统简化与非能动事故响应为核心的两环路压水堆。",
    stats: [
      ["≈1.1 GW", "Net electric output · 净电功率"],
      ["2", "Primary loops · 一回路环路"],
      ["157", "Fuel assemblies · 燃料组件"],
    ],
    safety: "PASSIVE FIRST · 非能动优先",
  },
  hualong: {
    eyebrow: "HPR1000 · Generation III",
    name: "HUALONG ONE",
    zh: "华龙一号",
    summary:
      "A three-loop PWR combining redundant active trains with passive backup safety.",
    summaryZh: "将冗余能动系列与非能动后备安全相结合的三环路压水堆。",
    stats: [
      ["≈1.1 GW", "Electric class · 电功率等级"],
      ["3", "Primary loops · 一回路环路"],
      ["177", "Fuel assemblies · 燃料组件"],
    ],
    safety: "ACTIVE + PASSIVE · 能动 + 非能动",
  },
} as const;

const FLOW_STEPS = [
  ["01", "FISSION HEAT", "核裂变释热"],
  ["02", "PRIMARY WATER", "一回路高压水"],
  ["03", "STEAM", "二回路蒸汽"],
  ["04", "TURBINE + GRID", "汽轮机 + 电网"],
];

type SceneBuild = {
  root: THREE.Group;
  groups: Partial<Record<ComponentId, THREE.Group>>;
  labelPoints: Partial<Record<ComponentId, THREE.Vector3>>;
  flowParticles: THREE.Mesh[];
};

function physical(
  color: string,
  options: Partial<THREE.MeshPhysicalMaterialParameters> = {},
) {
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.42,
    metalness: 0.18,
    ...options,
  });
  material.userData.baseOpacity = options.opacity ?? 1;
  material.userData.baseTransparent = options.transparent ?? false;
  material.userData.baseEmissiveIntensity = options.emissiveIntensity ?? 0;
  return material;
}

function cylinder(
  radius: number,
  height: number,
  color: string,
  position: [number, number, number],
  materialOptions: Partial<THREE.MeshPhysicalMaterialParameters> = {},
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.04, height, 40),
    physical(color, materialOptions),
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function tank(
  radius: number,
  height: number,
  color: string,
  position: [number, number, number],
) {
  const group = new THREE.Group();
  const body = cylinder(radius, height, color, [0, 0, 0], {
    roughness: 0.3,
    metalness: 0.32,
  });
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    physical(color, { roughness: 0.3, metalness: 0.32 }),
  );
  top.position.y = height / 2;
  const bottom = top.clone();
  bottom.rotation.z = Math.PI;
  bottom.position.y = -height / 2;
  group.add(body, top, bottom);
  group.position.set(...position);
  return group;
}

function pipe(
  points: [number, number, number][],
  color: string,
  radius = 0.11,
) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point)),
  );
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, radius, 10, false),
    physical(color, {
      roughness: 0.28,
      metalness: 0.2,
      emissive: color,
      emissiveIntensity: 0.16,
    }),
  );
  mesh.castShadow = true;
  return { mesh, curve };
}

function mark(group: THREE.Group, id: ComponentId) {
  group.userData.componentId = id;
  group.traverse((object) => {
    object.userData.componentId = id;
  });
  return group;
}

function addFlowParticles(
  root: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  color: string,
  target: THREE.Mesh[],
) {
  for (let index = 0; index < 5; index += 1) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshBasicMaterial({ color }),
    );
    dot.userData.curve = curve;
    dot.userData.offset = index / 5;
    dot.userData.speed = color === "#f26b43" ? 0.045 : 0.038;
    root.add(dot);
    target.push(dot);
  }
}

function createSceneModel(model: ModelKey): SceneBuild {
  const root = new THREE.Group();
  const groups: Partial<Record<ComponentId, THREE.Group>> = {};
  const labelPoints: Partial<Record<ComponentId, THREE.Vector3>> = {};
  const flowParticles: THREE.Mesh[] = [];

  const vessel = new THREE.Group();
  const vesselBody = cylinder(1.05, 3.35, "#d95d38", [0, 0.15, 0], {
    roughness: 0.34,
    metalness: 0.36,
    transparent: true,
    opacity: 0.9,
  });
  const vesselTop = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    physical("#e57045", { roughness: 0.34, metalness: 0.34 }),
  );
  vesselTop.position.y = 1.83;
  const vesselBottom = vesselTop.clone();
  vesselBottom.rotation.z = Math.PI;
  vesselBottom.position.y = -1.53;
  const head = cylinder(0.58, 0.42, "#28494b", [0, 2.25, 0]);
  for (let index = -3; index <= 3; index += 1) {
    const rod = cylinder(0.035, 0.75, "#f6c66d", [index * 0.17, 2.75, 0]);
    vessel.add(rod);
  }
  vessel.add(vesselBody, vesselTop, vesselBottom, head);
  groups.reactor = mark(vessel, "reactor");
  root.add(vessel);

  const core = new THREE.Group();
  const coreGlow = cylinder(0.67, 1.8, "#ff9c4c", [0, -0.25, 0], {
    emissive: "#ff7a37",
    emissiveIntensity: 0.78,
    transparent: true,
    opacity: 0.82,
  });
  core.add(coreGlow);
  for (let x = -3; x <= 3; x += 1) {
    for (let z = -3; z <= 3; z += 1) {
      if (Math.hypot(x, z) <= 3.4) {
        core.add(cylinder(0.035, 1.95, "#ffd07a", [x * 0.17, -0.22, z * 0.17]));
      }
    }
  }
  groups.core = mark(core, "core");
  root.add(core);

  const steamGroup = new THREE.Group();
  const pumpGroup = new THREE.Group();
  const loopPositions =
    model === "ap1000"
      ? [
          new THREE.Vector3(-3.65, 0.4, 0.15),
          new THREE.Vector3(3.65, 0.4, 0.15),
        ]
      : [
          new THREE.Vector3(-3.55, 0.35, -0.65),
          new THREE.Vector3(3.55, 0.35, -0.65),
          new THREE.Vector3(0, 0.35, 3.75),
        ];

  loopPositions.forEach((position, loopIndex) => {
    const sg = tank(0.78, 2.75, "#cbd7d0", [position.x, position.y, position.z]);
    const cap = cylinder(0.3, 0.34, "#7c9694", [position.x, position.y + 1.75, position.z]);
    steamGroup.add(sg, cap);

    const direction = new THREE.Vector3(position.x, 0, position.z).normalize();
    const hotStart: [number, number, number] = [
      direction.x * 1.0,
      0.8,
      direction.z * 1.0,
    ];
    const hotEnd: [number, number, number] = [
      position.x - direction.x * 0.55,
      0.8,
      position.z - direction.z * 0.55,
    ];
    const hot = pipe(
      [
        hotStart,
        [direction.x * 2.1, 1.25, direction.z * 2.1],
        hotEnd,
      ],
      "#f26b43",
      0.14,
    );
    steamGroup.add(hot.mesh);
    addFlowParticles(root, hot.curve, "#ff8a52", flowParticles);

    const pumpsPerLoop = model === "ap1000" ? 2 : 1;
    for (let pumpIndex = 0; pumpIndex < pumpsPerLoop; pumpIndex += 1) {
      const tangent = new THREE.Vector3(-direction.z, 0, direction.x);
      const offset = pumpsPerLoop === 2 ? (pumpIndex === 0 ? -0.42 : 0.42) : 0;
      const pumpPosition = position
        .clone()
        .addScaledVector(direction, -0.12)
        .addScaledVector(tangent, offset);
      pumpPosition.y = -1.45;
      const pump = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 24, 18),
        physical("#58bdc3", { roughness: 0.28, metalness: 0.36 }),
      );
      pump.scale.set(1, 1.25, 1);
      pump.position.copy(pumpPosition);
      pumpGroup.add(pump);

      const cold = pipe(
        [
          [position.x, -0.95, position.z],
          [pumpPosition.x, pumpPosition.y, pumpPosition.z],
          [direction.x * 1.05, -0.9, direction.z * 1.05],
        ],
        "#47aeb7",
        0.12,
      );
      pumpGroup.add(cold.mesh);
      addFlowParticles(root, cold.curve, "#72d7dd", flowParticles);
    }
    if (loopIndex === 0) {
      labelPoints.steam = new THREE.Vector3(position.x, 1.9, position.z);
      labelPoints.pump = new THREE.Vector3(position.x, -1.35, position.z);
    }
  });
  groups.steam = mark(steamGroup, "steam");
  groups.pump = mark(pumpGroup, "pump");
  root.add(steamGroup, pumpGroup);

  const pressurizerPosition: [number, number, number] =
    model === "ap1000" ? [2.2, 1.25, -3.35] : [2.4, 1.15, -3.4];
  const pressurizer = new THREE.Group();
  pressurizer.add(tank(0.54, 2.4, "#9cad9e", pressurizerPosition));
  const surge = pipe(
    [
      [pressurizerPosition[0], pressurizerPosition[1] - 1.5, pressurizerPosition[2]],
      [1.75, -0.45, -2.0],
      [0.8, 0.65, -0.45],
    ],
    "#b7c8b7",
    0.07,
  );
  pressurizer.add(surge.mesh);
  groups.pressurizer = mark(pressurizer, "pressurizer");
  root.add(pressurizer);

  const containment = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(6.1, 6.1, 7.6, 72, 1, true, -0.72, Math.PI * 1.48),
    physical("#9bb0ad", {
      transparent: true,
      opacity: 0.13,
      roughness: 0.24,
      metalness: 0.12,
      side: THREE.DoubleSide,
    }),
  );
  shell.position.y = 0.8;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(6.1, 72, 32, -0.72, Math.PI * 1.48, 0, Math.PI / 2),
    physical("#9bb0ad", {
      transparent: true,
      opacity: 0.11,
      roughness: 0.24,
      metalness: 0.12,
      side: THREE.DoubleSide,
    }),
  );
  dome.position.y = 4.6;
  containment.add(shell, dome);
  if (model === "hualong") {
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(6.75, 6.75, 8.1, 72, 1, true, -0.72, Math.PI * 1.48),
      physical("#d2d4c9", {
        transparent: true,
        opacity: 0.09,
        roughness: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    outer.position.y = 0.85;
    const outerDome = new THREE.Mesh(
      new THREE.SphereGeometry(6.75, 72, 32, -0.72, Math.PI * 1.48, 0, Math.PI / 2),
      physical("#d2d4c9", {
        transparent: true,
        opacity: 0.07,
        roughness: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    outerDome.position.y = 4.9;
    containment.add(outer, outerDome);
  }
  groups.containment = mark(containment, "containment");
  root.add(containment);

  const safety = new THREE.Group();
  if (model === "ap1000") {
    const roofTank = tank(2.15, 0.7, "#64c5ca", [0, 6.2, 0]);
    roofTank.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mat = object.material as THREE.MeshPhysicalMaterial;
        mat.transparent = true;
        mat.opacity = 0.72;
        mat.userData.baseOpacity = 0.72;
      }
    });
    safety.add(roofTank);
    safety.add(tank(0.45, 1.15, "#67c8ce", [-1.75, 1.8, 2.4]));
    safety.add(tank(0.45, 1.15, "#67c8ce", [1.75, 1.8, 2.4]));
    const irwst = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.36, 14, 64, Math.PI * 1.55),
      physical("#58b9c1", {
        transparent: true,
        opacity: 0.62,
        emissive: "#3caab3",
        emissiveIntensity: 0.12,
      }),
    );
    irwst.rotation.x = Math.PI / 2;
    irwst.rotation.z = -0.85;
    irwst.position.y = -1.95;
    safety.add(irwst);
    labelPoints.safety = new THREE.Vector3(0, 6.35, 0);
  } else {
    const safetyPositions = [
      [-4.8, -0.25, 2.1],
      [4.8, -0.25, 2.1],
      [0, -0.25, -4.75],
    ] as [number, number, number][];
    safetyPositions.forEach((position) => {
      safety.add(tank(0.5, 1.4, "#62c4ca", position));
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.55, 0.8),
        physical("#8aa89f", { roughness: 0.55 }),
      );
      block.position.set(position[0], -1.5, position[2]);
      safety.add(block);
    });
    labelPoints.safety = new THREE.Vector3(-4.8, 0.7, 2.1);
  }
  groups.safety = mark(safety, "safety");
  root.add(safety);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(model === "ap1000" ? 6.4 : 7.05, model === "ap1000" ? 6.4 : 7.05, 0.32, 72),
    physical("#1b3f42", { roughness: 0.74, metalness: 0.05 }),
  );
  platform.position.y = -2.35;
  platform.receiveShadow = true;
  root.add(platform);

  labelPoints.reactor = new THREE.Vector3(0, 2.55, 0);
  labelPoints.core = new THREE.Vector3(0, -0.15, 0);
  labelPoints.pressurizer = new THREE.Vector3(
    pressurizerPosition[0],
    pressurizerPosition[1] + 1.35,
    pressurizerPosition[2],
  );
  labelPoints.containment = new THREE.Vector3(-5.7, 4.1, -0.2);

  return { root, groups, labelPoints, flowParticles };
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

export function ReactorExplorer() {
  const [model, setModel] = useState<ModelKey>("ap1000");
  const [selected, setSelected] = useState<ComponentId>("reactor");
  const [isolated, setIsolated] = useState<ComponentId | null>(null);
  const [heatFlow, setHeatFlow] = useState(true);
  const [cutaway, setCutaway] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupsRef = useRef<Partial<Record<ComponentId, THREE.Group>>>({});
  const labelsRef = useRef<Partial<Record<ComponentId, HTMLButtonElement | null>>>({});
  const labelPointsRef = useRef<Partial<Record<ComponentId, THREE.Vector3>>>({});
  const flowParticlesRef = useRef<THREE.Mesh[]>([]);
  const controlsRef = useRef<OrbitControls | null>(null);

  const components = COMPONENTS[model];
  const copy = MODEL_COPY[model];
  const current = useMemo(
    () => components.find((component) => component.id === selected) ?? components[0],
    [components, selected],
  );

  const chooseModel = useCallback((next: ModelKey) => {
    setModel(next);
    setSelected("reactor");
    setIsolated(null);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#102f32");
    scene.fog = new THREE.FogExp2("#102f32", 0.019);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(12.8, 7.7, 15.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.prepend(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.target.set(0, 1.15, 0);
    controls.minDistance = 9;
    controls.maxDistance = 26;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotateSpeed = 0.65;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight("#c6f7f3", "#071516", 2.25));
    const keyLight = new THREE.DirectionalLight("#ffe2bd", 5.2);
    keyLight.position.set(8, 12, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight("#50d1d5", 14, 28, 2);
    rimLight.position.set(-7, 3, 5);
    scene.add(rimLight);
    const warmLight = new THREE.PointLight("#ff7748", 9, 18, 2);
    warmLight.position.set(4, 2, -5);
    scene.add(warmLight);

    const grid = new THREE.GridHelper(28, 28, "#315457", "#1c4043");
    grid.position.y = -2.52;
    scene.add(grid);

    const build = createSceneModel(model);
    scene.add(build.root);
    groupsRef.current = build.groups;
    labelPointsRef.current = build.labelPoints;
    flowParticlesRef.current = build.flowParticles;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPosition = { x: 0, y: 0 };
    const handlePointerDown = (event: PointerEvent) => {
      downPosition = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downPosition.x, event.clientY - downPosition.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(build.root, true).find((entry) => entry.object.userData.componentId);
      if (hit) setSelected(hit.object.userData.componentId as ComponentId);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const animationStartedAt = performance.now();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = (performance.now() - animationStartedAt) / 1000;
      controls.update();
      build.flowParticles.forEach((particle) => {
        const curve = particle.userData.curve as THREE.CatmullRomCurve3;
        const progress = (elapsed * particle.userData.speed + particle.userData.offset) % 1;
        particle.position.copy(curve.getPointAt(progress));
      });

      Object.entries(build.labelPoints).forEach(([id, point]) => {
        const element = labelsRef.current[id as ComponentId];
        if (!element || !point) return;
        const projected = point.clone().project(camera);
        const visible = projected.z > -1 && projected.z < 1;
        element.style.transform = `translate3d(${(projected.x * 0.5 + 0.5) * mount.clientWidth}px, ${(-projected.y * 0.5 + 0.5) * mount.clientHeight}px, 0)`;
        element.style.opacity = visible ? "1" : "0";
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      renderer.dispose();
      disposeObject(build.root);
      scene.remove(build.root);
      renderer.domElement.remove();
      groupsRef.current = {};
      flowParticlesRef.current = [];
    };
  }, [model]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate, model]);

  useEffect(() => {
    flowParticlesRef.current.forEach((particle) => {
      particle.visible = heatFlow;
    });
  }, [heatFlow, model]);

  useEffect(() => {
    Object.entries(groupsRef.current).forEach(([id, group]) => {
      if (!group) return;
      const isSelected = id === selected;
      const isDimmed = isolated !== null && id !== isolated;
      group.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return;
          const baseOpacity = Number(material.userData.baseOpacity ?? 1);
          const containmentFactor = id === "containment" && !cutaway ? 2.4 : 1;
          material.opacity = isDimmed
            ? Math.min(baseOpacity, 0.055)
            : Math.min(baseOpacity * containmentFactor, id === "containment" ? 0.38 : 1);
          material.transparent = material.opacity < 1;
          material.depthWrite = material.opacity > 0.18;
          material.emissiveIntensity = isSelected
            ? Math.max(material.emissiveIntensity, 0.38)
            : Number(material.userData.baseEmissiveIntensity ?? material.emissiveIntensity * 0.4);
        });
      });
    });
  }, [selected, isolated, cutaway, model]);

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PWR Atlas home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>
            <strong>PWR ATLAS</strong>
            <small>压水堆图谱</small>
          </span>
        </a>
        <div className="topbar-meta">
          <span className="live-dot" aria-hidden="true" />
          INTERACTIVE REACTOR STUDY · 交互式反应堆图解
        </div>
        <a className="method-link" href="#method">ABOUT THE MODEL ↘</a>
      </header>

      <section className="explorer" id="top">
        <aside className="intro-panel">
          <p className="section-kicker">01 / REACTOR DESIGN · 堆型</p>
          <div className="model-switch" role="tablist" aria-label="Choose reactor design">
            <button
              className={model === "ap1000" ? "active" : ""}
              onClick={() => chooseModel("ap1000")}
              role="tab"
              aria-selected={model === "ap1000"}
            >
              AP1000
            </button>
            <button
              className={model === "hualong" ? "active" : ""}
              onClick={() => chooseModel("hualong")}
              role="tab"
              aria-selected={model === "hualong"}
            >
              HUALONG ONE
            </button>
          </div>

          <div className="model-heading">
            <span>{copy.eyebrow}</span>
            <h1>{copy.name}</h1>
            <p className="model-zh">{copy.zh}</p>
          </div>
          <p className="summary">{copy.summary}</p>
          <p className="summary-zh">{copy.summaryZh}</p>

          <div className="stats">
            {copy.stats.map(([value, label]) => (
              <div className="stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="safety-tag">{copy.safety}</div>

          <div className="mobile-instruction">
            Drag to rotate · Pinch to zoom<br />拖动旋转 · 双指缩放
          </div>
        </aside>

        <section className="viewport-panel" aria-label={`Interactive 3D model of ${copy.name}`}>
          <div className="viewport-head">
            <div>
              <span className="view-index">3D / 01</span>
              <strong>NUCLEAR ISLAND CUTAWAY</strong>
              <small>核岛剖视图</small>
            </div>
            <span className="not-to-scale">SCHEMATIC · NOT TO SCALE<br />示意图 · 非按比例</span>
          </div>

          <div className="three-mount" ref={mountRef}>
            <div className="axis-hint" aria-hidden="true">
              <span>Y</span>
              <i />
              <b>X</b>
            </div>
            <div className="canvas-labels">
              {components.map((component) => (
                <button
                  key={`${model}-${component.id}`}
                  ref={(element) => {
                    labelsRef.current[component.id] = element;
                  }}
                  className={`canvas-label ${selected === component.id ? "selected" : ""}`}
                  onClick={() => setSelected(component.id)}
                >
                  <span>{component.index}</span>
                  <b>{component.shortEn}</b>
                  <small>{component.shortZh}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="view-controls" aria-label="3D view controls">
            <button className={heatFlow ? "active" : ""} onClick={() => setHeatFlow((value) => !value)}>
              <span className="control-icon flow-icon" aria-hidden="true" />
              Heat flow <small>热流</small>
            </button>
            <button className={cutaway ? "active" : ""} onClick={() => setCutaway((value) => !value)}>
              <span className="control-icon shell-icon" aria-hidden="true" />
              Cutaway <small>剖视</small>
            </button>
            <button className={autoRotate ? "active" : ""} onClick={() => setAutoRotate((value) => !value)}>
              <span className="control-icon rotate-icon" aria-hidden="true">↻</span>
              Auto rotate <small>自动旋转</small>
            </button>
          </div>
        </section>

        <aside className="detail-panel">
          <div className="detail-topline">
            <p className="section-kicker">02 / COMPONENT · 部件</p>
            <span>{current.index} / 07</span>
          </div>
          <div className="component-swatch" style={{ "--swatch": current.color } as CSSProperties}>
            <span>{current.index}</span>
          </div>
          <div className="detail-heading">
            <h2>{current.en}</h2>
            <p>{current.zh}</p>
          </div>
          <p className="detail-copy">{current.descriptionEn}</p>
          <p className="detail-copy zh">{current.descriptionZh}</p>
          <button
            className={`isolate-button ${isolated === current.id ? "active" : ""}`}
            onClick={() => setIsolated((value) => (value === current.id ? null : current.id))}
          >
            <span>{isolated === current.id ? "SHOW ALL" : "ISOLATE COMPONENT"}</span>
            <small>{isolated === current.id ? "显示全部" : "单独显示部件"}</small>
            <b aria-hidden="true">{isolated === current.id ? "−" : "+"}</b>
          </button>

          <nav className="component-list" aria-label="Reactor component list">
            {components.map((component) => (
              <button
                key={component.id}
                className={selected === component.id ? "active" : ""}
                onClick={() => setSelected(component.id)}
              >
                <span>{component.index}</span>
                <div>
                  <b>{component.en}</b>
                  <small>{component.zh}</small>
                </div>
                <i aria-hidden="true">↗</i>
              </button>
            ))}
          </nav>
        </aside>
      </section>

      <section className="flow-section" aria-labelledby="flow-title">
        <div className="flow-heading">
          <p className="section-kicker">03 / ENERGY PATH · 能量路径</p>
          <h2 id="flow-title">FROM FISSION TO ELECTRICITY</h2>
          <p>从核裂变到电力</p>
        </div>
        <div className="flow-track">
          {FLOW_STEPS.map(([number, en, zh], index) => (
            <div className="flow-step" key={number}>
              <span>{number}</span>
              <div className={`flow-node node-${index + 1}`}><i /></div>
              <strong>{en}</strong>
              <small>{zh}</small>
            </div>
          ))}
        </div>
        <div className="flow-legend">
          <span><i className="hot" />≈ 315°C HOT LEG · 热管段</span>
          <span><i className="cold" />≈ 280–290°C COLD LEG · 冷管段</span>
          <span><i className="steam" />SECONDARY STEAM · 二回路蒸汽</span>
        </div>
      </section>

      <footer id="method">
        <div>
          <strong>ABOUT THIS MODEL · 关于本模型</strong>
          <p>
            A high-level educational visualization of major plant systems. Geometry and routing are simplified and must not be used for engineering, operation or safety analysis.
          </p>
          <p className="zh">
            本图用于展示核电站主要系统的基本关系；几何尺寸和管线布置均经过简化，不可用于工程设计、运行或安全分析。
          </p>
        </div>
        <div className="sources">
          <strong>TECHNICAL REFERENCES · 技术参考</strong>
          <a href="https://westinghousenuclear.com/new-plants/ap1000-pwr/safety/passive-safety-systems/" target="_blank" rel="noreferrer">
            Westinghouse AP1000 passive safety ↗
          </a>
          <a href="https://aris.iaea.org/Publications/20-02619E_ALWCR_ARIS_Booklet_WEB.pdf" target="_blank" rel="noreferrer">
            IAEA advanced large water-cooled reactors ↗
          </a>
        </div>
        <span className="footer-mark">PWR<br />ATLAS</span>
      </footer>
    </main>
  );
}
