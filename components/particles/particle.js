/**
 * @fileoverview Particle class for use with the acid equilibrium simulation.
 * @copyright Carnegie Mellon University 2018
 * @author Meg Richards (mouse@cmu.edu)
 */

/** @module particles */

/**
 * A generic particle.
 * @class Particle
 * @param {!object} sketch - Parent p5 sketch.
 * @param {number} x=0 - X position of particle.
 * @param {number} y=0 - Y position of particle.
 */
export default function Particle(sketch,x=0,y=0) {
    /**
     * The parent p5 sketch containing the particle.
     * @type {object}
     */
    this.p = sketch;
    this.createSprite(x,y);

    /**
     * Cleanups necesary to perform for other particles if this particle is removed
     * from the simulation. Particles register and deregister their cleanup
     * functions when they join and separate this particle, respectively.
     * @typedef CleanupHash
     * @property {string} particle_name - The particle type requiring cleanup.
     * @property {CleanupFunction} cleanup - A function to perform the cleanup.
     * @example
     * {
     *   "ConjugateBase":
     *   function(proton) {
     *     var baseParticle = proton.base.particle;
     *     baseParticle.release_proton();
     *   }
     * }
     */
    
    /**
     * Defines a cleanup procedure for a particle if this particle is removed
     * from the simulation.
     * @typedef CleanupFunction
     * @type function
     * @param {object} particle - The particle being removed from the simulation.
     */

    /**
     * Cleanup function registry.
     * @type {CleanupHash}
     * @default {}
     */
    this.cleanups = {};
}

/**
 * Collider x position from the center of the sprite.
 * @type {number}
 * @default 0
 */
Particle.prototype.collider_offset_x = 0;

/**
 * Collider y position from the center of the sprite.
 * @type {number}
 * @default 0
 */
Particle.prototype.collider_offset_y = 0;

/**
 * Collider radius for overlap detection between sprites.
 * @type {number}
 * @default 1
 */
Particle.prototype.collider_radius = 1;

/**
 * Relative path of the image for the particle's sprite.
 * @type {string}
 * @default null
 */
Particle.prototype.image_path = null;

/**
 * Maximum for possible velocities of the particle.
 * @type {number}
 * @default 0
 */
Particle.prototype.max_velocity = 0;

/**
 * Particles and their corresponding reactions.
 * @typedef ReactionsHash
 * @property {string} particle_class - The particle type being reacted to.
 * @property {ReactionFunction} reaction - A function performing the reaction.
 * @example
 * {
 *   "Proton":
 *   function(baseSprite,protonSprite) {
 *     console.log("Just hit a Proton!");
 *   }
 * }
 */

/**
 * Defines the reaction between particles.
 * @typedef ReactionFunction
 * @type function
 * @param {object} source_sprite - The source particle sprite.
 * @param {object} target_sprite - The target particle sprite.
 */

/**
 * Reactions a particle will have with other particles.
 * @type {ReactionsHash}
 * @default {}
 */
Particle.prototype.reacts_with = {};

/**
 * Perform any actions required before particles can be created.
 * @function preload
 * @static
 * @memberof module:particle~Particle
 * @param {object} p - Parent p5 sketch.
 */
Particle.prototype.preload = function(p) {
    /**
     * The image to be used for the particle sprite.
     * @type {object}
     */
    this.image = p.loadImage(this.image_path);
};

/**
 * Creates a corresponding sprite for a particle.
 * @param {number} x=0 - X position for sprite.
 * @param {number} y=0 - Y position for sprite.
 */
Particle.prototype.createSprite = function(x=0,y=0) {
    var p = this.p;
    if( p ) {
        this.sprite = p.createSprite(x,y);
        if( this.image != null )
            this.sprite.addImage("default",this.image);
        this.sprite.setCollider('circle',
                                this.collider_offset_x,
                                this.collider_offset_y,
                                this.collider_radius);
        this.sprite.velocity.x = this.randomVelocity();
        this.sprite.velocity.y = this.randomVelocity();
        this.sprite.particle = this;
    }
};

/**
 * Calculate a random velocity for a particle from [-max_velocity, max_velocity]
 * where max_velocity is the particle's max velocity property.
 * @returns {number} A possibly negative random velocity
 */
Particle.prototype.randomVelocity = function() {
    // Generate a random number [0,2*max_velocity]; then subtract max velocity
    return this.max_velocity - Math.random()*2*this.max_velocity;
};

/**
 * Remove the particle from the simulation.
 */
Particle.prototype.remove = function(){
    var cleanups = this.cleanups;
    for( var i in Object.keys(cleanups) ) {
        var particle_name = Object.keys(cleanups)[i];
        cleanups[particle_name](this);
    }
    this.sprite.remove();
};

/**
 * Update this particle during the sketch's draw iteration.
 */
Particle.prototype.update = function(){};