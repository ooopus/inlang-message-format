import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as hjson from 'hjson-ts';

describe('Test en.hjson file', () => {
  const filePath = join(__dirname, '../../example/translations/en.hjson');
  let parsedContent: any;

  beforeAll(() => {
    const fileContent = readFileSync(filePath, 'utf-8');
    parsedContent = hjson.parse(fileContent);
  });

  it('should parse HJSON file correctly', () => {
    expect(parsedContent).toBeDefined();
    expect(typeof parsedContent).toBe('object');
  });

  it('should contain all required message keys', () => {
    expect(parsedContent).toHaveProperty('some_happy_cat');
    expect(parsedContent).toHaveProperty('blue_horse_shoe');
    expect(parsedContent).toHaveProperty('jojo_mountain_day');
  });

  it('should parse simple messages correctly', () => {
    expect(parsedContent.some_happy_cat).toBe('Read more about Lix');
  });

  it('should parse messages with variables correctly', () => {
    expect(parsedContent.blue_horse_shoe).toBe(
      'Hello {username}, welcome to the {placename}!'
    );
  });

  it('should parse complex conditional messages correctly', () => {
    expect(parsedContent.jojo_mountain_day).toHaveProperty('match');
    const match = parsedContent.jojo_mountain_day.match;

    // Verify all condition branches
    expect(match['platform=android, userGender=male']).toBe(
      '{username} has to download the app on his phone from the Google Play Store.'
    );

    expect(match['platform=ios, userGender=female']).toBe(
      '{username} has to download the app on her iPhone from the App Store.'
    );

    expect(match['platform=*, userGender=*']).toBe(
      'The person has to download the app.'
    );
  });

  it('should maintain correct message format', () => {
    // Verify variable format
    expect(parsedContent.blue_horse_shoe).toMatch(/{username}/);
    expect(parsedContent.blue_horse_shoe).toMatch(/{placename}/);

    // Verify variables in conditional messages
    const androidMessage =
      parsedContent.jojo_mountain_day.match[
        'platform=android, userGender=male'
      ];
    expect(androidMessage).toMatch(/{username}/);
  });

  it('should not contain invalid message keys', () => {
    expect(parsedContent).not.toHaveProperty('invalid_key');
    expect(Object.keys(parsedContent)).toHaveLength(4);
  });
});
