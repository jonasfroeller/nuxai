<script setup lang="ts">
import { Bird, Rabbit, Turtle } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
</script>

<template>
    <form class="grid items-start w-full gap-6 p-2">
        <fieldset class="grid gap-6 p-4 border rounded-lg">
            <legend class="px-1 -ml-1 text-sm font-medium">
                Settings
            </legend>
            <div class="grid gap-3">
                <Label for="model">Model</Label>
                <Select>
                    <SelectTrigger id="model" class="items-start [&_[data-description]]:hidden">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="genesis">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Rabbit class="size-5" />
                                <div class="grid gap-0.5">
                                    <p>
                                        Neural
                                        <span class="font-medium text-foreground">
                                            Genesis
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description>
                                        Our fastest model for general use cases.
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="explorer">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Bird class="size-5" />
                                <div class="grid gap-0.5">
                                    <p>
                                        Neural
                                        <span class="font-medium text-foreground">
                                            Explorer
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description>
                                        Performance and speed for efficiency.
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="quantum">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Turtle class="size-5" />
                                <div class="grid gap-0.5">
                                    <p>
                                        Neural
                                        <span class="font-medium text-foreground">
                                            Quantum
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description>
                                        The most powerful model for complex computations.
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </fieldset>
    </form>
</template>

<style scoped></style>
