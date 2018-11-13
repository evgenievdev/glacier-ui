(function( _core , utils , internal ) {

	//"use strict";
 	var _modname = "scheduler";

 	var constructTask = function( cfg ) {

 		cfg = cfg || {};

 		return {
 			task: cfg.task,
 			//arguments: (cfg.arguments == undefined || cfg.arguments == null) ? [] : cfg.arguments,
 			date: cfg.date,
 			frames: typeof cfg.frames == 'object' && !cfg.frames.length ? [cfg.frames] : cfg.frames,
 			//iterations: cfg.iterations <= 0 ? 1 : cfg.iterations,
 			intervals: cfg.intervals < 0 ? 1000 : cfg.intervals,
 			pending: true
 		};

 	}

	var instance = function( options , events ) {
 		
 		this.cfg = this.defaultSettings();
 		utils.applyProperties( this.cfg , options );

 		this.events = {
 			onSensorTick: false,
 			onTaskStart: false,
 			onTaskFinish: false,
 			onFrameStart: false,
 			onFrameFinish: false
 		};
 		utils.applyProperties( this.events , events );

		this.tasks = {};

		this.setupSensor();

	}

	Object.assign( instance.prototype , {

		defaultSettings: function() {

			return {
				tickInterval: 1000
			};

		},
 
		addTask: function( ref , cfg ) {
 			
 			if( this.taskExists(ref) ) { return false; }	
			var o = constructTask( cfg );
			if( !o ) { return false; }
			this.tasks[ ref ] = o;
			return true;

		},

		removeTask: function( ref ) {

			if( !this.taskExists(ref) ) { return false; }
			this.pause();	
			delete this.tasks[ref];
			this.resume();
			return true;

		},
  
		taskExists: function( ref ) {

			if( this.tasks[ref] == undefined || typeof this.tasks[ref] !== 'object' ) {
				return false;
			}
			return true;

		},

		clearSensor: function() {

			if( this.sensor !== undefined && this.sensor !== null ) {
				clearInterval( this.sensor );
			}
			this.sensor = null;

		},

		setupSensor: function() {

			this.clearSensor();

			var delay = this.cfg.tickInterval; 	// By default the sensor ticks once every 1000 milliseconds (i.e. 1 second)

			this.sensor = setInterval( function(){

				if( this.paused ) { return; }
				// Get the current date and time in milliseconds
				var cd = Date.now();

				if( typeof this.events["onSensorTick"] === 'function' ) {
					this.events["onSensorTick"]({ scheduler: this , taskCount: Object.keys(this.tasks).length });
				}

				var o, t, dt, f, ivs;
				for( var ref in this.tasks ) {

					o = this.tasks[ref];

					if( !o.pending ) { continue; }
					t = o.date;
					if( t instanceof Date ) {
						t = +t;	// Convert to milliseconds
					}
					if( t < 0 ) { t = 0; }
					dt = cd - t;
					// If the current time is equal to or surpasses the specified time to execute this task, execute all of its frames
					if( dt >= 0 ) {
						// Iterate through all defined frames for the task and execute them with the respective arguments for each frame
						for( var i = 0 ; i < o.frames.length; i++ ) {

							f = o.frames[i];
							ivs = o.intervals;
							
							// If intervals is <= 0 then the task will be executed immediately.
							// NOTE! It is necessary to bind these properties to the setTimeout callback, or else they won't get passed directly from the loop
							setTimeout( function(){
 
								// If this is the first frame, call the task start event
								if( this.id === 0 ) {
									if( typeof this.scheduler.events["onTaskStart"] === 'function' ) {
										this.scheduler.events["onTaskStart"]( this );
									}
								}

								if( typeof this.scheduler.events["onFrameStart"] === 'function' ) {
									this.scheduler.events["onFrameStart"]( this );
								}

								o.task.apply( { frameIndex: this.id , taskReference: this.taskReference } , this.frame.arguments );
							 	
								if( typeof this.scheduler.events["onFrameFinish"] === 'function' ) {
									this.scheduler.events["onFrameFinish"]( this );
								}

								// If this is the last frame, remove the task from the queue to avoid infinite loops.
								if( this.id === this.obj.frames.length-1 ) {
									// Call the task finish event
									if( typeof this.scheduler.events["onTaskFinish"] === 'function' ) {
										this.scheduler.events["onTaskFinish"]( this );
									}
									delete this.scheduler.tasks[ this.taskReference ];
								}

							}.bind({ scheduler: this , id: i , obj: o , frame: f , taskReference: ref }), ivs*i );
							 
						}
						// After the task execution service has been setup, set this task as NOT PENDING anymore. This will make the sensor ignore it while it executes fully.
						o.pending = false;

					}

				}

			}.bind(this) , delay );

		},

		pause: function() {
			this.paused = true;
		},

		resume: function() {
			this.paused = false;
		}

	});

	internal.defineModule( _modname , instance );

})( Glacier , Glacier.utils , Glacier.internal );


 