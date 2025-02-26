import Matter from "matter-js";
import { io } from "../app.js";
const playerCooldowns = new Map();
export const initializeShoot = (socket, engine, players, bullets) => {
    // Track already hit bullets
    const hitBullets = new Set();
    // Check for bullet collision
    Matter.Events.on(engine, "collisionStart", (event) => {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            // Check if bullet hits player
            if (bodyA.label === "bullet") {
                // Player has been hit
                if (!hitBullets.has(bodyA.id)) {
                    // Update player health on hit
                    const player = players.get(bodyB.label);
                    if (player) {
                        player.health -= 1;
                        if (player.health > 0) {
                            io.emit("playerHealthUpdate", {
                                playerId: bodyB.label,
                                health: player.health,
                            });
                        }
                        // If player dies
                        if (player.health <= 0) {
                            io.emit("playerDied", { playerId: bodyB.label });
                        }
                    }
                    io.emit("playerHit", { playerId: bodyB.id, bulletId: bodyA.id });
                    Matter.World.remove(engine.world, bodyA);
                    hitBullets.add(bodyA.id);
                }
            }
            if (bodyB.label === "bullet") {
                // Player has been hit
                if (!hitBullets.has(bodyB.id)) {
                    // Update player health on hit
                    const player = players.get(bodyA.label);
                    if (player) {
                        player.health -= 1;
                        console.log(player.health);
                        if (player.health > 0) {
                            io.emit("playerHealthUpdate", {
                                playerId: bodyA.label,
                                health: player.health,
                            });
                        }
                        // If player dies
                        if (player.health <= 0) {
                            io.emit("playerDied", { playerId: bodyA.label });
                        }
                    }
                    io.emit("playerHit", { playerId: bodyA.id, bulletId: bodyB.id });
                    Matter.World.remove(engine.world, bodyB);
                    hitBullets.add(bodyB.id);
                }
            }
        });
    });
    socket.on("shoot", ({ shooterId, targetId }) => {
        const shooter = players.get(shooterId);
        const target = players.get(targetId);
        // Check for target and shooter
        if (!shooter || !target)
            return;
        if (shooterId === targetId)
            return;
        // Implement cooldown check
        const currentTime = new Date().getTime();
        const lastShotTime = playerCooldowns.get(shooterId) || 0;
        if (currentTime - lastShotTime < 500)
            return;
        playerCooldowns.set(shooterId, currentTime);
        // Angle and velocity
        const angle = Math.atan2(target.body.position.y - shooter.body.position.y, target.body.position.x - shooter.body.position.x);
        const vx = Math.cos(angle) * 15;
        const vy = Math.sin(angle) * 15;
        // Create bullet body
        const bullet = Matter.Bodies.circle(shooter.body.position.x + Math.cos(angle) * 20, shooter.body.position.y + Math.sin(angle) * 20, 5, {
            restitution: 1,
            frictionAir: 0.01,
            label: "bullet",
        });
        // Set Matter velocity on bullet
        Matter.Body.setVelocity(bullet, {
            x: vx,
            y: vy,
        });
        // Add to world
        Matter.World.add(engine.world, bullet);
        bullets.set(bullet.id, bullet);
        // Notify client of bullet render
        io.emit("bulletCreated", {
            id: bullet.id,
            x: bullet.position.x,
            y: bullet.position.y,
            vx,
            vy,
        });
    });
};
