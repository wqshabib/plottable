///<reference path="../reference.ts" />

module Plottable {
  export interface ToggleCallback {
      (datum: any, newState: boolean): any;
  }
  export interface HoverCallback {
      (datum?: any): any;
  }
  export class InteractiveLegend extends Component.Legend {
    private _callbackClick: ToggleCallback;
    private _callbackHover: HoverCallback;

    // focus is the element currently being hovered over
    // if no elements are currently being hovered over, focus is undefined
    private focus: any;

    // this is the set of all elements that are currently toggled off
    private isOff: D3.Set;
    
    /**
     * Creates a InteractiveLegend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     * @param {ToggleCallback} cbc The function to be called when a legend entry is clicked.
     * @param {HoverCallback} cbh The function to be called when a legend entry is hovered over. 
     */
    constructor(colorScale: Scale.Color, cbc?: ToggleCallback, cbh?: HoverCallback) {
      this._callbackClick = cbc;
      this._callbackHover = cbh;
      this.isOff = d3.set();
      super(colorScale);
    }

    /**
     * Assigns or gets the callback to the InteractiveLegend
     * Call with argument of null to remove the callback
     * 
     * @param{ToggleCallback} callback The new callback function
     */
    public callbackClick(callback: ToggleCallback): InteractiveLegend;
    public callbackClick(): ToggleCallback;
    public callbackClick(callback?: ToggleCallback): any {
      if (callback !== undefined) {
        this._callbackClick = callback;
        return this;
      } else {
        return this;
      }
    }

    /**
     * Assigns or gets the callback to the InteractiveLegend
     * Call with argument of null to remove the callback
     * 
     * @param{HoverCallback} callback The new callback function
     */
    public callbackHover(callback: HoverCallback): InteractiveLegend;
    public callbackHover(): HoverCallback;
    public callbackHover(callback?: HoverCallback): any {
      if (callback !== undefined) {
        this._callbackHover = callback;
        return this;
      } else {
        return this;
      }
    }


    /**
     * Assigns a new ColorScale to the ToggleLegend.
     *
     * @param {ColorScale} scale
     * @returns {ToggleLegend} The calling ToggleLegend.
     */
    public scale(scale?: Scale.Color): any {
      if (scale != null) {
        super.scale(scale);
        // overwrite our previous listener from when we called super
        this._registerToBroadcaster (scale, () => {
          // preserve the state of already existing elements
          this.isOff = Util.Methods.intersection(this.isOff, d3.set(this.scale().domain()));
          this.focus = undefined;
          this._invalidateLayout();
        });
        this.isOff = Util.Methods.intersection(this.isOff, d3.set(this.scale().domain()));
        this.focus = undefined;
        this.updateClasses();
        return this;
      } else {
        return super.scale();
      }
    }

    public _doRender(): InteractiveLegend {
      super._doRender();
      this.updateClasses();
      var dataSelection = this.content.selectAll("." + Component.Legend._SUBELEMENT_CLASS);
      var func = (b: boolean) => (d: any, i: number) => {
        this.focus = b ? d : undefined;
        if (this._callbackHover != null) {
          this._callbackHover(this.focus);
        }
        this.updateClasses();
      };
      dataSelection.on("mouseover", func(true));
      dataSelection.on("mouseout", func(false));
      dataSelection.on("click", (d: any) => {
        var turningOn = this.isOff.has(d);
        if (turningOn) {
          this.isOff.remove(d);
        } else {
          this.isOff.add(d);
        }
        if (this._callbackClick != null) {
          this._callbackClick(d, turningOn);
        }
        this.updateClasses();
      });
      return this;
    }

    private updateClasses() {
      if (this._isSetup) {
        var dataSelection = this.content.selectAll("." + Component.Legend._SUBELEMENT_CLASS);
        // don't attach any classes if nothing is focused
        // this is so users can do something for things not focused (i.e. fading), or focused (i.e. highlighting)
        dataSelection.classed("focus", (d: any) => this.focus !== undefined ? this.focus === d : false);
        dataSelection.classed("not-focus", (d: any) => this.focus !== undefined ? this.focus !== d : false);

        dataSelection.classed("toggled-on", (d: any) => !this.isOff.has(d));
        dataSelection.classed("toggled-off", (d: any) => this.isOff.has(d));
      }
    }
  }
}
