'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  z: number;
  label: string;
  price: string;
}

export default function MarketplacePlanet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Initial 3D nodes representing local bazaars / listings
    const nodes: Node[] = [
      { x: -100, y: -50, z: 80, label: "iPhone 15", price: "₹65,000" },
      { x: 100, y: 80, z: -50, label: "MacBook Air", price: "₹82,000" },
      { x: -50, y: 100, z: -80, label: "Royal Enfield", price: "₹1,20,000" },
      { x: 80, y: -90, z: 60, label: "Sony Camera", price: "₹45,000" },
      { x: -120, y: 30, z: -30, label: "iPad Pro", price: "₹38,000" },
      { x: 50, y: -60, z: -100, label: "Office Chair", price: "₹8,500" },
      { x: -20, y: -110, z: -40, label: "MTB Bicycle", price: "₹14,000" },
      { x: 120, y: 10, z: 90, label: "Gaming PC", price: "₹75,000" },
    ];

    let angleX = 0.003;
    let angleY = 0.005;

    let mouseX = 0;
    let mouseY = 0;
    let targetAngleX = 0.003;
    let targetAngleY = 0.005;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      targetAngleY = x * 0.00003;
      targetAngleX = y * 0.00003;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const project = (x: number, y: number, z: number) => {
      const perspective = 300;
      const scale = perspective / (perspective + z);
      return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale,
        scale,
      };
    };

    const rotateX = (node: Node, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y = node.y * cos - node.z * sin;
      const z = node.z * cos + node.y * sin;
      node.y = y;
      node.z = z;
    };

    const rotateY = (node: Node, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = node.x * cos - node.z * sin;
      const z = node.z * cos + node.x * sin;
      node.x = x;
      node.z = z;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth rotation dampening
      angleX += (targetAngleX - angleX) * 0.1;
      angleY += (targetAngleY - angleY) * 0.1;

      // Draw wireframe grid rings
      const radius = 160;
      const rings = 4;
      ctx.strokeStyle = 'rgba(194, 89, 63, 0.07)'; // Terracotta wireframe
      ctx.lineWidth = 1;
      
      // Draw grid segments
      for (let r = 0; r < rings; r++) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius * ((r + 1) / rings), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw connections first
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(194, 89, 63, 0.15)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        rotateX(nodes[i], angleX);
        rotateY(nodes[i], angleY);
        const p1 = project(nodes[i].x, nodes[i].y, nodes[i].z);

        for (let j = i + 1; j < nodes.length; j++) {
          const p2 = project(nodes[j].x, nodes[j].y, nodes[j].z);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();

      // Draw nodes & physical tags
      for (const node of nodes) {
        const p = project(node.x, node.y, node.z);
        
        // Only draw visible foreground nodes
        if (node.z > -150) {
          // Node point
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(194, 89, 63, 0.85)'; // Terracotta glow
          ctx.fill();

          // Tactile Sony/MUJI Style Tag
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          
          // Draw subtle connector line to label
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 15, p.y - 15);
          ctx.strokeStyle = 'rgba(30, 30, 30, 0.3)';
          ctx.stroke();

          // Label text box
          const text = `${node.label} (${node.price})`;
          const textWidth = ctx.measureText(text).width;
          
          ctx.fillStyle = 'rgba(250, 246, 240, 0.95)'; // Ivory background
          ctx.strokeStyle = '#1e1e1e';
          ctx.lineWidth = 1;
          ctx.fillRect(p.x + 15, p.y - 25, textWidth + 8, 14);
          ctx.strokeRect(p.x + 15, p.y - 25, textWidth + 8, 14);

          ctx.fillStyle = '#1e1e1e';
          ctx.fillText(text, p.x + 19, p.y - 15);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
