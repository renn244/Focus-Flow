import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "./input";
import { Button } from "./button";

type PasswordInputProps = {
    containerClassName?: string;
} & ComponentProps<"input"> 

const PasswordInput = ({ containerClassName, className, ...props }: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className={cn("relative", className)}>
            <Input {...props} type={showPassword ? "text" : "password"} 
            className={cn(containerClassName, "pr-10")} />
            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground" disabled={props.disabled}
              aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((shown) => !shown)}>
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
        </div>
    )
}

export default PasswordInput;
