/**
 * Godot 4 Comprehensive Game Dev Workshop & Bengali Guide
 * Explains how Godot works, Node hierarchy, GDScript code templates, and live physics tweaker.
 */

import React, { useState } from 'react';
import { X, Copy, Check, Download, Play, Sliders, Layers, Code, BookOpen, ExternalLink } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface GodotTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export const GodotTutorialModal: React.FC<GodotTutorialModalProps> = ({
  isOpen,
  onClose,
  engineRef,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'nodes' | 'gdscript' | 'tweaker'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live tweakable physics values connected to engineRef.current.config
  const [speed, setSpeed] = useState(300);
  const [jumpForce, setJumpForce] = useState(560);
  const [gravity, setGravity] = useState(1350);
  const [dashForce, setDashForce] = useState(680);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSpeedChange = (newVal: number) => {
    setSpeed(newVal);
    if (engineRef.current) engineRef.current.config.playerSpeed = newVal;
  };

  const handleJumpChange = (newVal: number) => {
    setJumpForce(newVal);
    if (engineRef.current) engineRef.current.config.jumpForce = newVal;
  };

  const handleGravityChange = (newVal: number) => {
    setGravity(newVal);
    if (engineRef.current) engineRef.current.config.gravity = newVal;
  };

  const handleDashChange = (newVal: number) => {
    setDashForce(newVal);
    if (engineRef.current) engineRef.current.config.dashForce = newVal;
  };

  // Download real Godot 4 Player.gd script
  const downloadGodotScript = () => {
    const scriptContent = `extends CharacterBody2D
# ==========================================
# Godot 4.x - 2D Platformer Character Controller
# Generated from Godot Quest Studio
# ==========================================

@export var SPEED : float = ${speed}.0
@export var JUMP_VELOCITY : float = -${jumpForce}.0
@export var DASH_SPEED : float = ${dashForce}.0
@export var GRAVITY : float = ${gravity}.0

# Coyote time & Jump buffer
var coyote_time : float = 0.12
var coyote_timer : float = 0.0
var jump_buffer_time : float = 0.12
var jump_buffer_timer : float = 0.0

# Dash state
var is_dashing : bool = false
var dash_timer : float = 0.0
var dash_cooldown : float = 0.6
var dash_cooldown_timer : float = 0.0

@onready var sprite = $Sprite2D
@onready var anim = $AnimationPlayer

func _physics_process(delta: float) -> void:
    # 1. Timers
    if is_on_floor():
        coyote_timer = coyote_time
    else:
        coyote_timer -= delta
        velocity.y += GRAVITY * delta

    if Input.is_action_just_pressed("jump"):
        jump_buffer_timer = jump_buffer_time
    elif jump_buffer_timer > 0.0:
        jump_buffer_timer -= delta

    if dash_cooldown_timer > 0.0:
        dash_cooldown_timer -= delta

    # 2. Dash execution
    if Input.is_action_just_pressed("dash") and dash_cooldown_timer <= 0.0 and not is_dashing:
        is_dashing = true
        dash_timer = 0.16
        dash_cooldown_timer = dash_cooldown
        var dir = Input.get_axis("move_left", "move_right")
        if dir == 0.0:
            dir = -1.0 if sprite.flip_h else 1.0
        velocity.x = dir * DASH_SPEED
        velocity.y = 0.0

    if is_dashing:
        dash_timer -= delta
        if dash_timer <= 0.0:
            is_dashing = false

    # 3. Horizontal movement
    if not is_dashing:
        var direction := Input.get_axis("move_left", "move_right")
        if direction != 0.0:
            velocity.x = direction * SPEED
            sprite.flip_h = direction < 0.0
        else:
            velocity.x = move_toward(velocity.x, 0.0, SPEED * 8.0 * delta)

    # 4. Jump (with Coyote Time and Buffer)
    if jump_buffer_timer > 0.0 and coyote_timer > 0.0:
        velocity.y = JUMP_VELOCITY
        jump_buffer_timer = 0.0
        coyote_timer = 0.0

    # Variable jump height
    if Input.is_action_just_released("jump") and velocity.y < 0.0:
        velocity.y *= 0.5

    move_and_slide()
`;

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Player.gd';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0d1117] border border-[#38bdf8]/40 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161b26] border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Godot Logo Icon */}
            <div className="w-8 h-8 rounded bg-[#478cbf] flex items-center justify-center text-white font-bold shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-5 7c.83 0 1.5.67 1.5 1.5S7.83 15 7 15s-1.5-.67-1.5-1.5S6.17 12 7 12zm10 0c.83 0 1.5.67 1.5 1.5S17.83 15 17 15s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-5 6c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-mono font-bold text-white flex items-center gap-2">
                কীভাবে Godot দিয়ে গেম বানাবেন?
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Godot 4 Complete Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Godot Engine ৪-এ গেম ডেভেলপমেন্টের সহজ স্টেপ-বাই-স্টেপ বাংলা গাইড এবং GDScript
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0d1117] px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>১. স্টেপ-বাই-স্টেপ গাইড</span>
          </button>

          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'nodes'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>২. নোড ও সিন আর্কিটেকচার</span>
          </button>

          <button
            onClick={() => setActiveTab('gdscript')}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'gdscript'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>৩. GDScript সোর্স কোড</span>
          </button>

          <button
            onClick={() => setActiveTab('tweaker')}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tweaker'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>৪. লাইভ ফিজিক্স টুইকার</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: Step-by-Step Guide in Bengali */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Introduction Box */}
              <div className="p-4 rounded-lg bg-[#161b26] border border-cyan-500/30">
                <h3 className="text-base font-bold text-cyan-300 font-mono mb-2">
                  🎮 Godot Engine কেন গেম বানানোর জন্য সেরা?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Godot হলো একটি <strong>সম্পূর্ণ ফ্রি এবং ওপেন সোর্স (MIT License)</strong> গেম ইঞ্জিন। এতে কোনো রয়্যালটি বা সাবস্ক্রিপশন ফি নেই। এর সাইজ মাত্র ৫০-৭০ মেগাবাইট! কোনো ইন্সটলেশন দরকার হয় না, সরাসরি ডাবল-ক্লিক করলেই চালু হয়। এটি ২D গেমের জন্য পৃথিবীর সেরা এবং ৩D-র জন্যও চমৎকার।
                </p>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">১</span>
                    <span>Godot ডাউনলোড করুন</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <a href="https://godotengine.org/download" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-1">
                      godotengine.org <ExternalLink className="w-3 h-3" />
                    </a> থেকে <strong>Godot 4.x</strong> ডাউনলোড করুন। জিপ ফাইলটি আনজিপ করে এক্সিকিউটেবলে ডাবল ক্লিক করলেই কাজ শুরু!
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">২</span>
                    <span>নতুন প্রজেক্ট তৈরি করুন</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Godot ওপেন করে <strong>"New Project"</strong> এ ক্লিক করুন। প্রজেক্টের নাম দিন (যেমন: "MyCyberPlatformer"), রেন্ডারার হিসেবে <strong>Forward+</strong> অথবা <strong>Compatibility</strong> (লোয়ার-এন্ড পিসি/মোবাইলের জন্য) সিলেক্ট করুন।
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">৩</span>
                    <span>প্লেয়ার ক্যারেক্টার তৈরি</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    একটি <strong>CharacterBody2D</strong> নোড তৈরি করুন। এর নিচে চাইল্ড হিসেবে একটি <strong>CollisionShape2D</strong> (বক্স বা ক্যাপসুল শেপ) এবং একটি <strong>Sprite2D</strong> যোগ করুন। প্লেয়ারের জন্য GDScript যুক্ত করুন।
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">৪</span>
                    <span>ইনপুট ও কন্ট্রোল সেটআপ</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Project &gt; Project Settings &gt; <strong>Input Map</strong> এ যান। সেখানে <code className="text-cyan-300">move_left</code>, <code className="text-cyan-300">move_right</code>, <code className="text-cyan-300">jump</code>, <code className="text-cyan-300">attack</code>, <code className="text-cyan-300">dash</code> কী-বাইন্ডিং যুক্ত করুন।
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">৫</span>
                    <span>টাইলম্যাপ দিয়ে ওয়ার্ল্ড তৈরি</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    একটি <strong>TileMapLayer</strong> নোড নিন। আপনার স্প্রাইটশিট দিয়ে টাইলসেট তৈরি করে মাউস দিয়ে গ্রিডে প্লাটফর্ম, দেয়াল ও স্পাইক এঁকে ফেলুন। ফিজিক্স লেয়ার অন করে দিলেই প্লেয়ার সেখানে দাঁড়াতে পারবে!
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">৬</span>
                    <span>গেম এক্সপোর্ট (PC/Mobile/Web)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Project &gt; Export এ গিয়ে <strong>Windows Desktop (.exe)</strong>, <strong>Android (.apk)</strong> অথবা <strong>Web (HTML5)</strong> হিসেবে ১-ক্লিকেই এক্সপোর্ট করে বন্ধুদের সাথে শেয়ার করুন!
                  </p>
                </div>
              </div>

              {/* Ready to play banner */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-mono font-bold text-white text-sm">
                    💡 এই গেমটি Godot ৪ আর্কিটেকচার অনুযায়ী হুবহু তৈরি!
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    আপনি এখনই গেমটি খেলে অনুভব করতে পারেন এবং নিচের ট্যাব থেকে সম্পূর্ণ GDScript কোড কপি করে নিতে পারেন।
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer whitespace-nowrap"
                >
                  গেম খেলা শুরু করুন (PLAY)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Godot Node Tree Architecture */}
          {activeTab === 'nodes' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300">
                Godot-এ প্রতিটি এলিমেন্ট একটি <strong>Node</strong> এবং নোডগুলোর সমষ্টি হলো একটি <strong>Scene</strong>। এই প্ল্যাটফর্মার গেমের সম্পূর্ণ নোড ট্রি নিচে দেখানো হলো:
              </p>

              <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 font-mono text-xs sm:text-sm space-y-2 text-slate-300">
                <div className="text-cyan-400 font-bold">MainScene (Node2D)</div>
                <div className="pl-4 border-l border-slate-700 space-y-1.5">
                  <div className="text-sky-300">├── WorldEnvironment (Glow, Ambient light)</div>
                  <div className="text-sky-300">├── TileMap (Ground, Platforms, Walls)</div>
                  <div className="text-sky-300">├── Hazards (Node2D)</div>
                  <div className="pl-6 border-l border-slate-700">
                    <div>└── Area2D (Spikes &gt; CollisionShape2D)</div>
                  </div>
                  <div className="text-emerald-400 font-bold">├── Player (CharacterBody2D) &lt;-- Main Hero</div>
                  <div className="pl-6 border-l border-slate-700 space-y-1">
                    <div>├── Sprite2D (Hero visuals &amp; visor)</div>
                    <div>├── CollisionShape2D (CapsuleShape2D)</div>
                    <div>├── Camera2D (Smooth drag lerp &amp; limits)</div>
                    <div>├── AnimationPlayer (Run, Jump, Attack, Dash)</div>
                    <div>├── AttackHitbox (Area2D)</div>
                    <div>├── GPUParticles2D (Jet thrusters &amp; dash trail)</div>
                    <div>└── AudioStreamPlayer2D (Jump, Slash, Dash SFX)</div>
                  </div>
                  <div className="text-rose-400 font-bold">├── Enemies (Node2D)</div>
                  <div className="pl-6 border-l border-slate-700 space-y-1">
                    <div>├── SlimeEnemy (CharacterBody2D)</div>
                    <div>├── TurretDrone (CharacterBody2D + RayCast2D)</div>
                    <div>└── BossSentinel (CharacterBody2D + Phase Controller)</div>
                  </div>
                  <div className="text-amber-300">├── Collectibles (Node2D)</div>
                  <div className="pl-6 border-l border-slate-700">
                    <div>└── GodotCore (Area2D &gt; body_entered signal)</div>
                  </div>
                  <div className="text-purple-300">└── CanvasLayer (HUD &amp; UI)</div>
                  <div className="pl-6 border-l border-slate-700">
                    <div>├── HealthBar (ProgressBar)</div>
                    <div>├── DashCooldown (TextureProgressBar)</div>
                    <div>└── ScoreLabel (Label)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GDScript Code Templates */}
          {activeTab === 'gdscript' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Player.gd (Godot 4.x CharacterBody2D Controller)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={downloadGodotScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Player.gd</span>
                  </button>
                  <button
                    onClick={() => {
                      const code = `extends CharacterBody2D

@export var SPEED = 300.0
@export var JUMP_VELOCITY = -560.0
@export var GRAVITY = 1350.0

var coyote_timer := 0.0
var jump_buffer := 0.0

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity.y += GRAVITY * delta
        coyote_timer -= delta
    else:
        coyote_timer = 0.12

    if Input.is_action_just_pressed("jump"):
        jump_buffer = 0.12
    elif jump_buffer > 0.0:
        jump_buffer -= delta

    if jump_buffer > 0.0 and coyote_timer > 0.0:
        velocity.y = JUMP_VELOCITY
        jump_buffer = 0.0
        coyote_timer = 0.0

    var direction = Input.get_axis("move_left", "move_right")
    if direction:
        velocity.x = direction * SPEED
    else:
        velocity.x = move_toward(velocity.x, 0, SPEED * 8.0 * delta)

    move_and_slide()`;
                      copyToClipboard(code, 'player');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs transition cursor-pointer"
                  >
                    {copiedKey === 'player' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'player' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-lg bg-[#080b10] border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`extends CharacterBody2D

# Godot 4.x - Character Controller
@export var SPEED : float = ${speed}.0
@export var JUMP_VELOCITY : float = -${jumpForce}.0
@export var GRAVITY : float = ${gravity}.0
@export var DASH_SPEED : float = ${dashForce}.0

# Coyote time & Jump buffer (Responsive controls feel)
var coyote_timer : float = 0.0
var jump_buffer : float = 0.0

func _physics_process(delta: float) -> void:
    # 1. Gravity and Ground Check
    if not is_on_floor():
        velocity.y += GRAVITY * delta
        coyote_timer -= delta
    else:
        coyote_timer = 0.12

    # 2. Input Buffering
    if Input.is_action_just_pressed("jump"):
        jump_buffer = 0.12
    elif jump_buffer > 0.0:
        jump_buffer -= delta

    # 3. Jump Execution
    if jump_buffer > 0.0 and coyote_timer > 0.0:
        velocity.y = JUMP_VELOCITY
        jump_buffer = 0.0
        coyote_timer = 0.0

    # 4. Horizontal Velocity
    var direction := Input.get_axis("move_left", "move_right")
    if direction != 0.0:
        velocity.x = direction * SPEED
    else:
        velocity.x = move_toward(velocity.x, 0.0, SPEED * 8.0 * delta)

    # 5. Godot 4 Collision & Physics Resolution
    move_and_slide()`}
              </pre>
            </div>
          )}

          {/* TAB 4: Live Physics Tweaker */}
          {activeTab === 'tweaker' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-[#161b26] border border-cyan-500/30">
                <h4 className="font-mono font-bold text-cyan-300 text-sm mb-1">
                  ⚡ লাইভ ফিজিক্স টুইকার (Live GDScript Value Tweaker)
                </h4>
                <p className="text-xs text-slate-300">
                  নিচের স্লাইডারগুলো নাড়িয়ে প্লেয়ারের ফিজিক্স পরিবর্তন করুন। এটি সরাসরি চলমান গেম ইঞ্জিনে রিয়েল-টাইমে কার্যকর হবে!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Speed Slider */}
                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Player Speed (SPEED):</span>
                    <span className="text-cyan-400 font-bold">{speed} px/s</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="600"
                    step="10"
                    value={speed}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>150 (Slow)</span>
                    <span>300 (Normal)</span>
                    <span>600 (Sonic)</span>
                  </div>
                </div>

                {/* Jump Force Slider */}
                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Jump Velocity (JUMP_VELOCITY):</span>
                    <span className="text-cyan-400 font-bold">{jumpForce} px/s</span>
                  </div>
                  <input
                    type="range"
                    min="350"
                    max="850"
                    step="10"
                    value={jumpForce}
                    onChange={(e) => handleJumpChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>350 (Heavy)</span>
                    <span>560 (Balanced)</span>
                    <span>850 (Moon Jump)</span>
                  </div>
                </div>

                {/* Gravity Slider */}
                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Gravity (GRAVITY):</span>
                    <span className="text-cyan-400 font-bold">{gravity} px/s²</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="2400"
                    step="50"
                    value={gravity}
                    onChange={(e) => handleGravityChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>600 (Floaty)</span>
                    <span>1350 (Standard)</span>
                    <span>2400 (Heavy)</span>
                  </div>
                </div>

                {/* Dash Force Slider */}
                <div className="p-4 rounded-lg bg-[#131822] border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Dash Force (DASH_SPEED):</span>
                    <span className="text-cyan-400 font-bold">{dashForce} px/s</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="1200"
                    step="20"
                    value={dashForce}
                    onChange={(e) => handleDashChange(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>400 (Gentle)</span>
                    <span>680 (Balanced)</span>
                    <span>1200 (Teleport)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    handleSpeedChange(300);
                    handleJumpChange(560);
                    handleGravityChange(1350);
                    handleDashChange(680);
                  }}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Apply &amp; Test in Game
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#161b26] border-t border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Godot 4.x</span> · GDScript 2.0 · Built with Canvas 2D
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition cursor-pointer"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
