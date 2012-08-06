#import <CoreLocation/CoreLocation.h>
#import "StoresDownloadHandler.h"
#import "SubmitOrderViewController.h"
#import "NSString+CountString.h"

@interface SubmitOrderViewController() <UISearchBarDelegate, CLLocationManagerDelegate, StoresDownloadDelegate, UIPickerViewDataSource, UIPickerViewDelegate>
@end

@implementation SubmitOrderViewController
{
    CLLocationManager *_locMan;
    NSManagedObject *_order;

    // Array of StoresDownloadHandler
    NSMutableArray *_requests;

    NSArray *_stores;
}

@synthesize confirmSwitch;
@synthesize formView;
@synthesize storePicker;
@synthesize storeSearchBar;
@synthesize usernameField;
@synthesize passwordField;
@synthesize scrollView;
@synthesize submitButton;
@synthesize textLabel;

- (void)viewDidLoad
{
    [super viewDidLoad];

    _requests = [[NSMutableArray alloc] init];

    NSString *cachedLocation = [self readCachedLocation];
    if([cachedLocation length] > 0)
    {
        self.storeSearchBar.text = [self readCachedLocation];
        [self searchBarTextDidEndEditing:self.storeSearchBar];
    }

    _locMan = [[CLLocationManager alloc] init];
    _locMan.delegate = self;
    [_locMan startUpdatingLocation];

    [NSTimer timerWithTimeInterval:30 target:self selector:@selector(onLocationTimeout) userInfo:nil repeats:false];

    [self.passwordField addTarget:self action:@selector(onPasswordFieldReturnPressed) forControlEvents:UIControlEventEditingDidEndOnExit];
    [self.usernameField addTarget:self action:@selector(onUsernameFieldReturnPressed) forControlEvents:UIControlEventEditingDidEndOnExit];

    self.storeSearchBar.delegate = self;
    self.storePicker.dataSource = self;
    self.storePicker.delegate = self;

    int numPics = [((NSString*)[_order valueForKey:@"pictureIds"]) countOccurencesOfString:@","];
    self.textLabel.text = [NSString stringWithFormat:NSLocalizedString(@"SubmitTextFmt", @""), numPics];

    self.scrollView.contentSize = CGSizeMake(self.scrollView.contentSize.width,
                                             self.formView.frame.origin.y + self.formView.frame.size.height + 8);
}

- (void)viewDidUnload
{
    [_locMan stopUpdatingLocation];
    _locMan = nil;

    [super viewDidUnload];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    return true;
}

- (void)setOrder:(NSManagedObject*)order
{
    _order = order;
}

- (void)onUsernameFieldReturnPressed
{
    [self.passwordField becomeFirstResponder];
}

- (void)onPasswordFieldReturnPressed
{
    [self.passwordField endEditing:true];
}

- (void)searchBarTextDidEndEditing:(UISearchBar*)searchBar
{
    NSLog(@"Search: %@", [searchBar text]);
    NSString *location = [searchBar text];
    [self writeCachedLocation:location];

    StoresDownloadHandler *handler = [[StoresDownloadHandler alloc] initWithLocation:location resultDelegate:self];

    [_requests addObject:handler];
    [handler go];
}

- (BOOL)searchBarShouldEndEditing:(UISearchBar*)searchBar
{
    return true;
}

- (void)searchBarSearchButtonClicked:(UISearchBar*)searchBar
{
    [searchBar resignFirstResponder];
}

- (void)locationManager:(CLLocationManager*)manager didUpdateToLocation:(CLLocation*)newLocation fromLocation:(CLLocation*)oldLocation
{
    if(!newLocation || newLocation.horizontalAccuracy < 0)
        return;

    [_locMan stopUpdatingLocation];
    _locMan = nil;

    storeSearchBar.text = [NSString stringWithFormat:@"%.5f;%.5f",
                           newLocation.coordinate.latitude,
                           newLocation.coordinate.longitude];
    [storeSearchBar resignFirstResponder];
    [self searchBarTextDidEndEditing:storeSearchBar];
}

- (void)locationManager:(CLLocationManager*)manager didFailWithError:(NSError*)error
{
    [self showErrorWithDescription:[error localizedDescription]];
}

- (void)showErrorWithDescription:(NSString*)description
{
    [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", @"")
                                message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToGetLocation", @""), description]
                               delegate:nil
                      cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                      otherButtonTitles:nil] show];
}

- (void)onLocationTimeout
{
    [_locMan stopUpdatingLocation];
    _locMan = nil;
}

- (NSString*)cachedLocationFilename
{
    NSString *docDir = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    return [docDir stringByAppendingPathComponent:@"cached-location.txt"];
}

- (NSString*)readCachedLocation
{
    NSError *error = nil;

    NSString *location = [NSString stringWithContentsOfFile:[self cachedLocationFilename] encoding:NSUTF8StringEncoding error:&error];

    if(error)
    {
        NSLog(@"Failed to read cached location: %@", [error localizedDescription]);
        return nil;
    }

    return location;
}

- (void)writeCachedLocation:(NSString*)location
{
    if([location length] < 2)
        return;

    NSError *error = nil;

    [location writeToFile:[self cachedLocationFilename] atomically:true encoding:NSUTF8StringEncoding error:&error];

    if(error)
        NSLog(@"Failed to cache location: %@", [error localizedDescription]);
}

- (void)storesRetrieved:(NSArray*)stores error:(NSString*)error
{
    if(error)
    {
        [[[UIAlertView alloc] initWithTitle:NSLocalizedString(@"Error", @"")
                                    message:[NSString stringWithFormat:@"%@: %@", NSLocalizedString(@"FailedToGetStores", @""), error]
                                   delegate:nil
                          cancelButtonTitle:NSLocalizedString(@"DismissError", @"")
                          otherButtonTitles:nil] show];
    }
    else
    {
        int selectedIndex = [self.storePicker selectedRowInComponent:0];
        int selectedStoreId = -1;

        if([_stores count] > 0 && selectedIndex >= 0)
            selectedStoreId = [[((NSDictionary*)[_stores objectAtIndex:selectedIndex]) valueForKey:@"id"] intValue];

        _stores = stores;
        [self.storePicker reloadAllComponents];

        if(selectedStoreId != -1)
            for(int i = 0; i < [_stores count]; ++i)
                if(selectedStoreId == [[((NSDictionary*)[_stores objectAtIndex:i]) valueForKey:@"id"] intValue])
                {
                    [self.storePicker selectRow:i inComponent:0 animated:false];
                    break;
                }
    }
}

#pragma mark - Store picker view data source

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView
{
    return 1;
}

- (NSInteger)pickerView:(UIPickerView*)pickerView numberOfRowsInComponent:(NSInteger)component
{
    return [_stores count];
}

#pragma mark - Store picker view delegate

- (NSString*)pickerView:(UIPickerView*)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component
{
    return [((NSDictionary*)[_stores objectAtIndex:row]) valueForKey:@"name"];
}

@end
