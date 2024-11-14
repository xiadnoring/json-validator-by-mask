export type JsonMaskItem = string|{[key: string]: JsonMaskItem}|JsonMaskItem[]|any;
export enum JsonMaskTypes {
    ANY = -1,
    INTEGER = 0,
    DECIMAL = 1,
    STRING = 2,
    OBJECT = 3,
    ARRAY = 4,
    NULL = 5,
    BOOLEAN = 6,
    NUMBER = 7
};

export type JsonMaskType = {
    type?: JsonMaskTypes, // type of object
    value?: any|{[key: string]: JsonMaskObject}|JsonMaskObject[], // recursive equal
    mean?: any, // strongly equal 
    min_mean?: number, // min value (length)
    max_mean?: number, // max value (length)
    default?: any|{[key: string]: JsonMaskObject}|JsonMaskObject[], // default item for array,
    regex?: RegExp
};

export type JsonMaskObject = [
    boolean, // maybe not exists
    JsonMaskType[]
];

export enum JsonMaskBracketType {
    NONE = -1,
    CIRCLE = 0,
    SQUARE = 1
};

export enum JsonMaskSignsEquality {
    NONE = -1,
    EQUAL = 0,
    GREATER = 1,
    LESS = 2,
    GREATER_OR_EQUAL = 3,
    LESS_OR_EQUAL = 4
};

export enum JsonMaskBufferType {
    NONE = -1,
    INTEGER = 0,
    MEAN = 1
};

export enum JsonMaskErrorCode {
    FATAL = 0,
    PARSE_TYPE = 1,
    PARSE_UNEXPECTED_END = 2,
    INVALID_CHAR = 3
}

const JsonMaskErrorMsg: Map <number, string> = new Map ([
    [JsonMaskErrorCode.FATAL, "Fatal error during parsing"],
    [JsonMaskErrorCode.PARSE_TYPE, "Error parsing type"],
    [JsonMaskErrorCode.PARSE_UNEXPECTED_END, "Unexpected end"],
    [JsonMaskErrorCode.INVALID_CHAR, "Invalid char"]
]);

class JsonMaskParseError extends Error {
    errnum: JsonMaskErrorCode
    original: null|string

    constructor(errnum: JsonMaskErrorCode, i: number|undefined, comment = "") {
        const message = (JsonMaskErrorMsg.get (errnum) ?? '(without error message)') + (i !== undefined ? ` at the ${i + 1} letter.` : '') + (comment ? `\n${comment}` : '');
        super(message);
        this.errnum = errnum;
        this.message = message;
        this.original = null;
    }
}

class JsonMask {
    private handler: (ch: string, it: number) => void; 
    private buffer: string;
    private prehandler: typeof this.handler|null;
    private current: JsonMaskObject;
    private last: JsonMaskType;
    private bracket_type: JsonMaskBracketType;
    private sign_equality: JsonMaskSignsEquality;
    private buffer_type: JsonMaskBufferType;
    private quotes: boolean;
    private escaped: boolean;

    /**
     * initialize a class to check json objects for validity when creating json or an existing one
     * 
     * @param content expression or JsonMask
     */
    constructor (content?: JsonMaskItem) {
        this.handler = this._skip_white_space;
        this.buffer = '';
        this.sign_equality = JsonMaskSignsEquality.NONE;
        this.prehandler = this._parse_type;
        this.bracket_type = JsonMaskBracketType.NONE;
        this.buffer_type = JsonMaskBufferType.NONE;

        this.current = content !== undefined ? this._parse (content) : [false, []];
        this.last = this._last_type (this.current);
        this.quotes = false;
        this.escaped = false;
    }

    private get_type (item: any) {
        if (item instanceof Array) { return JsonMaskTypes.ARRAY; }
        if (item instanceof Object) { return JsonMaskTypes.OBJECT; }
        if (typeof item == 'string') { return JsonMaskTypes.STRING; }
        if (typeof item == 'number') { return this.get_number_type (item); }
        if (typeof item == 'boolean') { return JsonMaskTypes.BOOLEAN; }
        if (item === null) { return JsonMaskTypes.NULL; }
        throw new JsonMaskParseError (JsonMaskErrorCode.PARSE_TYPE, undefined, `get_type(...): the variable has the wrong object type.\nAllowed types: array,object,string,number(integer,decimal),boolean,null`);
    }

    private get_number_type (item: number) {
        if (item % 1 == 0) { return JsonMaskTypes.INTEGER; }
        else { return JsonMaskTypes.DECIMAL; }
    }

    private _parse_type (ch: string, it: number) {
        const isletter = /^[a-z]+$/gi.test (ch);

        if (isletter) {
            this.buffer += ch;
            return;
        }

        let special_tag = false;
        switch (this.buffer.toLowerCase()) {
            case 'none': this.current[0] = true; special_tag = true; break;
        }

        if (!special_tag) {
            this.current[1].push ({});
            this.last = this._last_type (this.current);

            switch (this.buffer.toLowerCase()) {
                case 'string': this.last.type = JsonMaskTypes.STRING; break;
                case 'integer': this.last.type = JsonMaskTypes.INTEGER; break;
                case 'decimal': this.last.type = JsonMaskTypes.DECIMAL; break;
                case 'null': this.last.type = JsonMaskTypes.NULL; break;
                case 'bool': this.last.type = JsonMaskTypes.BOOLEAN; break;
                case 'any': this.last.type = JsonMaskTypes.ANY; break;
                case 'number': this.last.type = JsonMaskTypes.NUMBER; break;
                default: throw new JsonMaskParseError (JsonMaskErrorCode.PARSE_TYPE, it, `'${this.buffer}' is invalid.\nAllowed types: string,integer,decimal,null,bool,any,number`); break;
            }
        }

        this.buffer = '';
        this.handler = this._skip_white_space;
        this.prehandler = this._parse_after_type_name;
        this.handler(ch, it);
    }

    private _parse_after_type_name (ch: string, it: number) {
        if (ch == '(') {
            this.handler = this._parse_inner_brackets_mean;
            this.bracket_type = JsonMaskBracketType.CIRCLE;
            return;
        }

        this.handler = this._parse_after_type;
        this.handler (ch, it);
    }

    private _parse_buffer (ch: string, it: number) {
        if (ch == ')' || ch == ']') {
            if (this.prehandler === null ) { throw new JsonMaskParseError (JsonMaskErrorCode.PARSE_UNEXPECTED_END, it, 'this.prehandler is null'); }
            this.prehandler (ch, it);
            return;
        }

        if (this.buffer_type == JsonMaskBufferType.INTEGER) {
            if (this._is_white_space (ch)) { 
                this.handler = this._skip_white_space;
                this.handler (ch, it);
                return;
            }
            if (!/[0-9\e\-\+]/.test (ch)) { throw new JsonMaskParseError (JsonMaskErrorCode.INVALID_CHAR, it); }
            this.buffer += ch;  

            return;
        }

        if (this.buffer_type == JsonMaskBufferType.MEAN) {
            if (this.quotes) {
                if (this.escaped) {
                    this.escaped = false;
                }
                else if (ch == '/') {
                    this.escaped = true;
                    return;
                }
                else if (ch == '"') {
                    this.quotes = false;
                    this.handler = this._skip_white_space;
                }
                this.buffer += ch;
            }
            else {
                if (ch == '"') {
                    if (this.buffer.length) { throw new JsonMaskParseError (JsonMaskErrorCode.INVALID_CHAR, it); }
                    this.buffer += ch;
                    this.quotes = true;
                    return;
                }

                if (this._is_white_space (ch)) {
                    this.handler = this._skip_white_space;
                    this.handler (ch, it);
                    return;
                }
                
                this.buffer += ch;
            }
            return;
        }
    }

    private _ret_inner_brackets (ch: string, it: number): boolean {
        if (this.bracket_type == JsonMaskBracketType.CIRCLE && ch == ')') {
            this.handler = this._parse_after_type;
            this.bracket_type = JsonMaskBracketType.NONE;
            return true;
        }

        if (this.bracket_type == JsonMaskBracketType.SQUARE && ch == ']') {
            this.handler = this._parse_after_type;
            this.bracket_type = JsonMaskBracketType.NONE;
            return true;
        }

        return false;
    }

    private _parse_inner_brackets_mean (ch: string, it: number) {
        if (this._ret_inner_brackets (ch, it)) { return; }
        if (!/^[tnf0-9\-\+\"]+$/g.test(ch)) {
            this.handler = this._skip_white_space;
            this.prehandler = this._parse_inner_brackets;
            this.handler (ch, it);
            return;
        }
        this.buffer_type = JsonMaskBufferType.MEAN;
        this.handler = this._parse_buffer;
        this.prehandler = (ch: string, it: number) => {
            if (this.buffer_type == JsonMaskBufferType.MEAN) {
                this.buffer_type = JsonMaskBufferType.NONE;
                const object = JSON.parse (this.buffer);
                this.last.mean = object;
                this.buffer = '';
            }

            this.handler = this._skip_white_space;
            this.prehandler = this._parse_inner_brackets;
            this.handler (ch, it);
        };

        this.handler(ch, it);
    }

    private _parse_inner_brackets (ch: string, it: number) {
        if (this.buffer_type == JsonMaskBufferType.INTEGER) {
            this.buffer_type = JsonMaskBufferType.NONE;
            let num = Number (this.buffer);
            this.buffer = '';
            switch (this.sign_equality) {
                case JsonMaskSignsEquality.GREATER_OR_EQUAL:
                    num --;
                case JsonMaskSignsEquality.GREATER:
                    this.last.min_mean = num;
                    break;
                case JsonMaskSignsEquality.LESS_OR_EQUAL:
                    num ++;
                case JsonMaskSignsEquality.LESS:
                    this.last.max_mean = num;
                    break;
                case JsonMaskSignsEquality.EQUAL:
                    this.last.max_mean = num + 1;
                    this.last.min_mean = num - 1;
                    break;
            }

            this.sign_equality = JsonMaskSignsEquality.NONE;
        }

        if (this._ret_inner_brackets (ch, it)) {
            return;
        }

        if (ch == '=') {
            if (this.sign_equality == JsonMaskSignsEquality.LESS) {
                this.sign_equality = JsonMaskSignsEquality.LESS_OR_EQUAL;
                return;
            }
            if (this.sign_equality == JsonMaskSignsEquality.GREATER) {
                this.sign_equality = JsonMaskSignsEquality.GREATER_OR_EQUAL;
                return;
            }
            if (this.sign_equality == JsonMaskSignsEquality.NONE) {
                this.sign_equality = JsonMaskSignsEquality.EQUAL;
                return;
            }
        }
        else if (ch == '>') {
            if (this.sign_equality == JsonMaskSignsEquality.NONE) {
                this.sign_equality = JsonMaskSignsEquality.GREATER;
                return;
            }
        }
        else if (ch == '<') {
            if (this.sign_equality == JsonMaskSignsEquality.NONE) {
                this.sign_equality = JsonMaskSignsEquality.LESS;
                return;
            }
        }
        else if (this.sign_equality != JsonMaskSignsEquality.NONE && /^[0-9\-\+]$/gi.test (ch)) {
            this.buffer_type = JsonMaskBufferType.INTEGER;
            this.prehandler = this._parse_inner_brackets;
            this.handler = this._parse_buffer;

            this.handler (ch, it);
            return;
        }

        throw new JsonMaskParseError (JsonMaskErrorCode.INVALID_CHAR, it);
    }

    private _parse_after_type (ch: string, it: number) {
        if (ch == '|') { 
            this.handler = this._parse_type; 
            return; 
        }
        
        if (ch == '[') {
            const array: JsonMaskType = {};
            array.default = this.current;
            array.type = JsonMaskTypes.ARRAY;
            this.current = [false, [array]];
            this.last = this._last_type (this.current);

            this.handler = this._parse_inner_brackets;
            this.bracket_type = JsonMaskBracketType.SQUARE;
            return;
        }

        this.handler = this._skip_white_space;
        this.prehandler = null;

        this._skip_white_space (ch, it);
    }

    private _is_white_space (ch: string) {
        switch (ch) {
            case '\t':
            case '\n':
            case '\s':
            case '\r':
            case ' ':
                return true;
            default:
                return false;
        }
    }

    private _skip_white_space (ch: string, it: number) {
        if (this._is_white_space (ch)) {
            return;
        }
        if (this.prehandler === null) {
            this.handler = (ch: string, it: number) => {
                // oh dears
                throw new JsonMaskParseError (JsonMaskErrorCode.INVALID_CHAR, it);
            };
            return;
        }
        this.handler = this.prehandler;
        this.prehandler = null;
        this.handler (ch, it);
    }

    private _last_type (object: JsonMaskObject): JsonMaskType {
        return object[1][object[1].length - 1];
    }

    private _set_last_type (type: JsonMaskType, object: JsonMaskObject): JsonMaskObject {
        object[1][object[1].length - 1] = type;
        return object;
    }

    private item (plain: string, result: JsonMaskObject): JsonMaskObject {
        try {
            if (plain.length < 3 || plain[0] != '{' 
                || (plain[plain.length - 1] != '}' && plain[plain.length - 2] != '\\')) { 
                result[1].push ({type: this.get_type (plain)});
                let last = this._last_type (result);
                last.mean = plain;
                return result;    
            }
            this.current = result;
            //this.last = last;
            this.handler = this._parse_type;

            // skip '{'
            for (let i = 1; i < plain.length; i++) {
                this.handler (plain[i], i);
            }
        }
        catch (e) {
            if (e instanceof Error && 'original' in e && e.original === null) {
                e.original = plain;
                e.message += (e.original !== undefined ? ` in ${JSON.stringify(e.original)}` : '');
            }


            throw e;
        }

        return this.current;
    } 

    private init_mask_object (plain?: JsonMaskItem): JsonMaskObject {
        return [ false, [] ];
    }

    parse (plain: JsonMaskItem) {
        return new JsonMask (plain).current;
    }

    private _parse (plain: JsonMaskItem, result: JsonMaskObject|null = null) {
        if (plain instanceof JsonMask) { result = plain.current; }
        else {
            if (result===null) { 
                result = this.init_mask_object(plain); 
            }
            const type = this.get_type (plain);
            if (type == JsonMaskTypes.STRING) { 
                result = this.item (plain as string, result);
            }
            else if (type == JsonMaskTypes.OBJECT) {
                result[1].push ({type});
                const last = this._last_type (result);
                last.value = {};
                //@ts-ignore
                for (const key in plain) {
                    const value = plain[key];
                    let item = last.value[key];
                    item = this.init_mask_object (value);
                    item = this._parse(value, item);
                    last.value[key] = item;
                }
            }
            else if (type == JsonMaskTypes.ARRAY) {
                result[1].push ({type});
                const last = this._last_type (result);
                last.value = Array (plain.length);
                //@ts-ignore
                for (let i = 0; i < plain.length; i++) {
                    last.value[i] = this.init_mask_object (plain[i]);
                    last.value[i] = this._parse(plain[i], last.value[i]);
                }
            }
            
            else {
                result[1].push ({type});
                const last = this._last_type (result);
                last.mean = plain;
            }
        }
        return result;
    }

    private _regex_valid (value: string, regex: RegExp) {
        const result = regex.test (value);
        regex.lastIndex = 0;
        return result;
    }

    private _compare_types (type: JsonMaskTypes, original: JsonMaskItem, mask: JsonMaskType): boolean {
        switch (mask.type) {
            case JsonMaskTypes.ANY:
                return true;
            case JsonMaskTypes.NULL:
                if (mask.type != type) { break; }
                return true;
            case JsonMaskTypes.BOOLEAN:
                if (mask.type != type || ('mean' in mask && mask.mean != original)) { break; }
                return true;
            case JsonMaskTypes.NUMBER:
                if ((mask.type != type && JsonMaskTypes.INTEGER != type && JsonMaskTypes.DECIMAL != type)
                    || ('mean' in mask && mask.mean != original) || (mask.max_mean !== undefined && mask.max_mean < original)
                    || (mask.min_mean !== undefined && mask.min_mean > original)) { break; }
                return true;
            case JsonMaskTypes.STRING:
                if (mask.type != type || (mask.min_mean !== undefined && mask.min_mean > original.length) || (mask.max_mean !== undefined && mask.max_mean < original.length)
                    || ('mean' in mask && mask.mean != original) || mask.regex !== undefined && !this._regex_valid (original, mask.regex)) { break; }
                return true;
            case JsonMaskTypes.ARRAY:
                if (mask.type != type || (mask.mean !== undefined && mask.mean != original) || (mask.value !== undefined && original.length > mask.value.length)
                    || (mask.max_mean !== undefined && mask.max_mean < original.length) || (mask.min_mean !== undefined && mask.min_mean > original.length)) { break; }
                if (mask.value !== undefined) {
                    /** error has been occured */
                    let flag = false;
                    for (let i = 0, j = 0; i < mask.value.length;) {
                        if (original.length <= j) {
                            if (mask.value[i][0]) { continue; }
                            else { flag = true; break; }
                        }
                        const result = this._recursive_valid (original[j], mask.value[i]);
                        if (!result) {
                            // may be none -> mask.value[0][0]
                            if ((mask.value.length - original.length) > (i - j) && mask.value[i][0] && i + 1 != mask.value.length) {
                                i++;
                                continue;
                            }

                            flag = true;
                            break;
                        }
                        
                        i++;
                        j++;
                    }
                    if (flag) { break; }
                }
                if (mask.default !== undefined) {
                    let flag = false;
                    for (const _n of original) {
                        if (!this._recursive_valid (_n, mask.default)) {
                            flag = true; break;
                        }
                    }
                    if (flag) { break; }
                }
                return true;
            case JsonMaskTypes.OBJECT:
                const length = Object.keys(original).length;
                if (mask.type != type || (mask.mean !== undefined && mask.mean != original) 
                    || (mask.value !== undefined && length > Object.keys (mask.value).length)
                    || (mask.max_mean !== undefined && length > mask.max_mean)
                    || (mask.min_mean !== undefined && length < mask.min_mean)) { break; }
                if (mask.value !== undefined) {
                    let flag = false;
                    for (const key of Object.keys (mask.value)) {
                        const value = mask.value[key];
                        if (!(key in original)) {
                            if (value[0]) { continue; }
                            else { flag = true; break; }
                        }
                        if (!this._recursive_valid (original[key], value)) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) { break; }
                }
                return true;
            case JsonMaskTypes.DECIMAL:
                if ((mask.type != type)
                    || ('mean' in mask && mask.mean != original) || (mask.max_mean !== undefined && mask.max_mean < original)
                    || (mask.min_mean !== undefined && mask.min_mean > original)) { break; }
                return true;
            case JsonMaskTypes.INTEGER:
                if ((mask.type != type)
                    || ('mean' in mask && mask.mean != original) || (mask.max_mean !== undefined && mask.max_mean < original)
                    || (mask.min_mean !== undefined && mask.min_mean > original)) { break; }
                return true;
        }

        return false;
    }

    private _recursive_valid (original: JsonMaskItem, current: JsonMaskObject): boolean {
        const type = this.get_type (original);
        const masks = current[1];
        for (const mask of masks) {
            // lets check each type
            if (this._compare_types (type, original, mask)) { 
                return true; }
        }

        return false
    }

    /**
     * check the validity of a json object
     * 
     * ### Usage:
     * ```tsx
     * const jm = new JsonMask ("{string(<=5)}");
     * console.log (jm.valid ("hello"));
     * ```
     * 
     * 
     * @param original json object to validate
     * @returns 
     */
    valid (original: JsonMaskItem): boolean {
        //console.log(JSON.stringify (this.current, null, 2));
        return this._recursive_valid (original, this.current);
    }

    _set_current (current: JsonMaskObject) {
        this.current = structuredClone(current);
    }

    _get_current () {
        return new Proxy (this.current, {
            set: undefined
        });
    }

    _set_regexp (regex: RegExp) {
        for (const _n of this.current[1]) {
            if (_n.type == JsonMaskTypes.STRING) {
                _n.regex = regex;
            }
        }
    }
}

/**
 * creating additional independent types for one element
 * 
 * ### Usage:
 * ```tsx
 * JsonMask.or ("{string(<=100)}", "{number(>=0)}", "{bool(false)}")
 * ```
 * 
 * @param originals expressions or JsonMasks
 * @returns 
 */
function or (...originals: JsonMaskItem[]): JsonMask {
    const new_original = new JsonMask ();
    const current = [false, []] as JsonMaskObject;
    for (const original of originals) {
        const _original = new_original.parse (original);
        current[1].push (..._original[1]);
        if (_original[0] && !original[0]) { original[0] = true; }
    }
    new_original._set_current (current);
    return new_original;
}

/**
 * creating an array with default value 'original'
 * 
 * ### Usage:
 * ```tsx
 * JsonMask.array("{string}")
 * ```
 * 
 * @param original expression or JsonMask
 * @param none can be none
 * @returns 
 */
function array (original: JsonMaskItem, none = false): JsonMask {
    const arr = new JsonMask ();
    const current = [none, [{type: JsonMaskTypes.ARRAY}]] as JsonMaskObject;
    current[1][0].default = arr.parse (original);
    arr._set_current (current);
    return arr;
}


/**
 * Adding a regular expression for additional checking
 * 
 * ### Usage:
 * ```tsx
 * JsonMask.regex("{string|none}", /^[a-zA-Z0-9]+$/g)
 * ```
 * 
 * @param original expression or JsonMask
 * @param regex regular expression to check a string 
 */
function regex (original: JsonMaskItem, regex: RegExp): JsonMask {
    const s = new JsonMask (original);
    s._set_regexp (regex);
    return s;
}

export {
    JsonMask,
    or,
    array,
    regex
}